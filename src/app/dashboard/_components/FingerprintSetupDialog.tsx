// components/dashboard/FingerprintSetupDialog.tsx - FIXED API TIMING ISSUE
"use client";

import { useAuthManager } from "@/components/shared/AuthenticationManager";
import EmployeeDropdown from "@/components/shared/EmployeeDropdown";
import EmployeeLoginDialog from "@/components/shared/EmployeeLoginDialog";
import FingerprintCard from "@/components/shared/FingerprintCard";
import FingerprintScanningDialog from "@/components/shared/FingerprintScanningDialog";
import { Button } from "@/components/ui/button";
import { useEmployeeSelection } from "@/hooks/useEmployeeSelection";
import { useSystemInfo } from "@/hooks/useSystemInfo";
import { showErrorAlert } from "@/lib/swal";
import { CheckCircle, X } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";

interface FingerprintSetupDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: () => void;
}

type FingerprintStep =
    | "employee-selection"
    | "finger1-scan"
    | "finger1-rescan"
    | "finger1-complete"
    | "finger2-scan"
    | "finger2-rescan"
    | "complete";

type ScanningType =
    | "finger1-scan"
    | "finger1-rescan"
    | "finger2-scan"
    | "finger2-rescan"
    | "";

interface FingerprintState {
    finger1ScanCompleted: boolean;
    finger1RescanCompleted: boolean;
    finger2ScanCompleted: boolean;
    finger2RescanCompleted: boolean;
}

interface ScanState {
    isDialogOpen: boolean;
    scanningType: ScanningType;
    isApiProcessing: boolean;
}

const useFingerprintFlow = () => {
    const [currentStep, setCurrentStep] =
        useState<FingerprintStep>("employee-selection");
    const [fingerprintState, setFingerprintState] = useState<FingerprintState>({
        finger1ScanCompleted: false,
        finger1RescanCompleted: false,
        finger2ScanCompleted: false,
        finger2RescanCompleted: false,
    });

    const updateFingerprintState = useCallback(
        (updates: Partial<FingerprintState>) => {
            setFingerprintState((prev) => ({ ...prev, ...updates }));
        },
        []
    );

    const resetFlow = useCallback(() => {
        setCurrentStep("employee-selection");
        setFingerprintState({
            finger1ScanCompleted: false,
            finger1RescanCompleted: false,
            finger2ScanCompleted: false,
            finger2RescanCompleted: false,
        });
    }, []);

    return {
        currentStep,
        setCurrentStep,
        fingerprintState,
        updateFingerprintState,
        resetFlow,
    };
};

const useScanningManager = () => {
    const [scanState, setScanState] = useState<ScanState>({
        isDialogOpen: false,
        scanningType: "",
        isApiProcessing: false,
    });

    const startScanning = useCallback((type: ScanningType) => {
        setScanState({
            isDialogOpen: true,
            scanningType: type,
            isApiProcessing: true,
        });
    }, []);

    const setApiComplete = useCallback((success: boolean) => {
        setScanState((prev) => ({
            ...prev,
            isApiProcessing: false,
        }));
    }, []);

    const closeScanDialog = useCallback(() => {
        setScanState({
            isDialogOpen: false,
            scanningType: "",
            isApiProcessing: false,
        });
    }, []);

    return {
        scanState,
        startScanning,
        setApiComplete,
        closeScanDialog,
    };
};

const FingerprintSetupDialog: FC<FingerprintSetupDialogProps> = ({
    isOpen,
    onClose,
    onRegister,
}) => {
    const {
        authState,
        checkAuthentication,
        handleLoginSuccess,
        handleLoginClose,
        resetAuth,
    } = useAuthManager();

    const {
        currentStep,
        setCurrentStep,
        fingerprintState,
        updateFingerprintState,
        resetFlow,
    } = useFingerprintFlow();

    const {
        employeeState,
        employees,
        isLoading,
        error,
        selectEmployee,
        toggleDropdown,
        updateSearchTerm,
        resetEmployee,
        refetch,
    } = useEmployeeSelection(authState.hasValidToken);

    const { scanState, startScanning, setApiComplete, closeScanDialog } =
        useScanningManager();

    const {
        macAddress,
        isLoading: isSystemLoading,
        error: systemError,
        refetch: refetchSystemInfo,
    } = useSystemInfo();

    const checkLocalStorageToken = (): boolean => {
        if (typeof window === "undefined") return false;

        try {
            const authToken = localStorage.getItem("auth-token");
            const userData = localStorage.getItem("user-data");

            console.log("🔍 FingerprintDialog - Checking localStorage token:", {
                hasAuthToken: !!authToken,
                hasUserData: !!userData,
                authTokenLength: authToken?.length || 0,
            });

            return !!(authToken && userData);
        } catch (error) {
            console.error("Error checking localStorage token:", error);
            return false;
        }
    };

    useEffect(() => {
        if (isOpen) {
            console.log("🔍 FingerprintDialog opened, checking auth...");

            const hasValidToken = checkLocalStorageToken();

            if (hasValidToken) {
                console.log(
                    "✅ FingerprintDialog - Valid token found in localStorage"
                );
                handleLoginSuccess({
                    id: 1,
                    fullname: "User",
                    username: "user",
                    email: "user@example.com",
                    phone: "123456789",
                    role_id: 1,
                    position_id: 1,
                    fingerprint1: "",
                    fingerprint2: "",
                });
            } else {
                console.log(
                    "❌ FingerprintDialog - No valid token, need login"
                );
                checkAuthentication();
            }
        }
    }, [isOpen, checkAuthentication, handleLoginSuccess]);

    useEffect(() => {
        if (
            isOpen &&
            authState.hasValidToken &&
            !macAddress &&
            !isSystemLoading &&
            !systemError
        ) {
            console.log("🔄 Refetching system info to get MAC address...");
            refetchSystemInfo();
        }
    }, [
        isOpen,
        authState.hasValidToken,
        macAddress,
        isSystemLoading,
        systemError,
        refetchSystemInfo,
    ]);

    const handleStartScanning = async (type: ScanningType) => {
        if (!employeeState.selectedEmployeeId) return;

        if (!macAddress) {
            await showErrorAlert(
                "System Error",
                "MAC address not available. Please ensure system service is running and try again.",
                "OK"
            );
            return;
        }

        startScanning(type);
        setCurrentStep(type as FingerprintStep);

        const fingerprintNumber = type.includes("finger1") ? 1 : 2;
        const isRescan = type.includes("rescan");
        const apiEndpoint = isRescan
            ? "/api/fingerprint/validate"
            : "/api/fingerprint/setup";

        try {
            console.log(
                `🚀 Starting ${
                    isRescan ? "validation" : "setup"
                } API call for ${type}...`
            );

            const fingerprintData = {
                user_id: employeeState.selectedEmployeeId,
                mac_address: macAddress,
                number_of_fingerprint: fingerprintNumber,
            };

            console.log("📤 Fingerprint API payload:", {
                ...fingerprintData,
                endpoint: apiEndpoint,
                type: isRescan ? "validation" : "setup",
            });

            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(fingerprintData),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    resetAuth();
                    setApiComplete(false);
                    closeScanDialog();
                    return;
                }
                const result = await response.json();
                throw new Error(
                    result.message ||
                        `Failed to ${
                            isRescan ? "validate" : "save"
                        } fingerprint ${fingerprintNumber}`
                );
            }

            const result = await response.json();

            if (isRescan) {
                if (!result.data?.matched) {
                    setApiComplete(false);
                    closeScanDialog();
                    setTimeout(async () => {
                        await showErrorAlert(
                            "Validation Failed",
                            `Fingerprint ${fingerprintNumber} doesn't match the previously registered fingerprint. Please try again.`,
                            "OK"
                        );
                    }, 100);
                    return;
                }
                console.log(
                    `✅ Fingerprint ${fingerprintNumber} validation successful - Match confirmed`
                );
            } else {
                console.log(
                    `✅ Fingerprint ${fingerprintNumber} setup successful`
                );
            }

            setApiComplete(true);
        } catch (error) {
            console.error(`❌ Error calling API for ${type}:`, error);
            setApiComplete(false);
            closeScanDialog();

            setTimeout(async () => {
                await showErrorAlert(
                    isRescan ? "Validation Failed" : "Scan Failed",
                    error instanceof Error
                        ? error.message
                        : `Failed to ${
                              isRescan ? "validate" : "save"
                          } fingerprint ${fingerprintNumber}. Please try again.`,
                    "OK"
                );
            }, 100);
        }
    };

    const handleEditFingerprint = useCallback(
        (type: ScanningType) => {
            if (type.includes("finger1")) {
                updateFingerprintState({
                    finger1ScanCompleted: false,
                    finger1RescanCompleted: false,
                });
                setCurrentStep("finger1-scan");
            } else {
                updateFingerprintState({
                    finger2ScanCompleted: false,
                    finger2RescanCompleted: false,
                });
                setCurrentStep("finger2-scan");
            }
        },
        [updateFingerprintState, setCurrentStep]
    );

    const handleScanComplete = useCallback(() => {
        switch (scanState.scanningType) {
            case "finger1-scan":
                updateFingerprintState({ finger1ScanCompleted: true });
                setCurrentStep("finger1-rescan");
                break;
            case "finger1-rescan":
                updateFingerprintState({ finger1RescanCompleted: true });
                setCurrentStep("finger1-complete");
                break;
            case "finger2-scan":
                updateFingerprintState({ finger2ScanCompleted: true });
                setCurrentStep("finger2-rescan");
                break;
            case "finger2-rescan":
                updateFingerprintState({ finger2RescanCompleted: true });
                setCurrentStep("complete");
                showSuccessDialog();
                break;
        }
        closeScanDialog();
    }, [
        scanState.scanningType,
        updateFingerprintState,
        setCurrentStep,
        closeScanDialog,
    ]);

    const handleNext = useCallback(() => {
        setCurrentStep("finger2-scan");
    }, [setCurrentStep]);

    const showSuccessDialog = async () => {
        return Swal.fire({
            icon: "success",
            title: "Fingerprint Success Added!",
            html: `
        <div class="text-sm text-gray-600 mb-4">
          Both fingerprints have been successfully registered for ${employeeState.selectedEmployeeName}.
        </div>
        <div class="text-xs text-gray-500">
          Redirecting to dashboard in <strong id="countdown">3</strong> seconds...
        </div>
      `,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
                const countdown = Swal.getPopup()?.querySelector("#countdown");
                let remainingTime = 3;
                const interval = setInterval(() => {
                    remainingTime--;
                    if (countdown)
                        countdown.textContent = remainingTime.toString();
                    if (remainingTime <= 0) clearInterval(interval);
                }, 1000);
            },
        }).then(() => {
            handleReset();
            onRegister();
            onClose();
        });
    };

    const handleReset = useCallback(() => {
        resetFlow();
        resetEmployee();
    }, [resetFlow, resetEmployee]);

    const handleClose = useCallback(() => {
        handleReset();
        resetAuth();
        onClose();
    }, [handleReset, resetAuth, onClose]);

    if (!isOpen) return null;

    if (!authState.hasValidToken) {
        return (
            <EmployeeLoginDialog
                isOpen={authState.isLoginDialogOpen}
                onClose={handleLoginClose}
                onLogin={handleLoginSuccess}
            />
        );
    }

    if (isSystemLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="bg-white rounded-lg p-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span>Loading system information...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (systemError) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={handleClose}
                ></div>
                <div className="bg-white rounded-lg p-8 relative z-10 max-w-md mx-4">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            System Error
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            {systemError}
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={refetchSystemInfo}
                                className="flex-1"
                            >
                                Retry
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case "employee-selection":
                return (
                    <>
                        <EmployeeDropdown
                            employees={employees}
                            isLoading={isLoading}
                            error={error}
                            isOpen={employeeState.showDropdown}
                            selectedName={employeeState.selectedEmployeeName}
                            searchTerm={employeeState.searchTerm}
                            onToggle={toggleDropdown}
                            onSelect={selectEmployee}
                            onSearchChange={updateSearchTerm}
                            onRetry={refetch}
                            isAuthenticated={authState.hasValidToken}
                        />

                        <div className="grid grid-cols-2 gap-6">
                            <FingerprintCard
                                title="Scan Fingerprint 1"
                                description="Place your finger on the scanner to start registration."
                                isCompleted={
                                    fingerprintState.finger1ScanCompleted
                                }
                                isEnabled={
                                    !!employeeState.selectedEmployeeId &&
                                    !!macAddress
                                }
                                onAction={() =>
                                    handleStartScanning("finger1-scan")
                                }
                                onEdit={() =>
                                    handleEditFingerprint("finger1-scan")
                                }
                                actionText="Start Scanning"
                            />

                            <FingerprintCard
                                title="Rescan Fingerprint 1"
                                description="Please scan your finger again to confirm your identity."
                                isCompleted={
                                    fingerprintState.finger1RescanCompleted
                                }
                                isEnabled={
                                    fingerprintState.finger1ScanCompleted &&
                                    !!macAddress
                                }
                                onAction={() =>
                                    handleStartScanning("finger1-rescan")
                                }
                                onEdit={() =>
                                    handleEditFingerprint("finger1-rescan")
                                }
                                actionText="Validate Fingerprint"
                            />
                        </div>
                    </>
                );

            case "finger1-scan":
            case "finger1-rescan":
                return (
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold mb-2">
                                Fingerprint 1 Setup
                            </h3>
                            <p className="text-gray-600">
                                Employee:{" "}
                                <strong>
                                    {employeeState.selectedEmployeeName}
                                </strong>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <FingerprintCard
                                title="Scan Fingerprint 1"
                                description="Place your finger on the scanner to start registration."
                                isCompleted={
                                    fingerprintState.finger1ScanCompleted
                                }
                                isEnabled={
                                    currentStep === "finger1-scan" &&
                                    !!macAddress
                                }
                                onAction={() =>
                                    handleStartScanning("finger1-scan")
                                }
                                onEdit={() =>
                                    handleEditFingerprint("finger1-scan")
                                }
                                actionText="Start Scanning"
                            />

                            <FingerprintCard
                                title="Rescan Fingerprint 1"
                                description="Please scan your finger again to confirm your identity."
                                isCompleted={
                                    fingerprintState.finger1RescanCompleted
                                }
                                isEnabled={
                                    currentStep === "finger1-rescan" &&
                                    !!macAddress
                                }
                                onAction={() =>
                                    handleStartScanning("finger1-rescan")
                                }
                                onEdit={() =>
                                    handleEditFingerprint("finger1-rescan")
                                }
                                actionText="Validate Fingerprint"
                            />
                        </div>
                    </div>
                );

            case "finger1-complete":
                return (
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                Fingerprint 1 Complete!
                            </h3>
                            <p className="text-gray-600">
                                Ready to setup Fingerprint 2 for{" "}
                                <strong>
                                    {employeeState.selectedEmployeeName}
                                </strong>
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <Button
                                onClick={handleNext}
                                className="bg-blue-600 hover:bg-blue-700 px-8"
                            >
                                Next - Setup Fingerprint 2
                            </Button>
                        </div>
                    </div>
                );

            case "finger2-scan":
            case "finger2-rescan":
                return (
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold mb-2">
                                Fingerprint 2 Setup
                            </h3>
                            <p className="text-gray-600">
                                Employee:{" "}
                                <strong>
                                    {employeeState.selectedEmployeeName}
                                </strong>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <FingerprintCard
                                title="Scan Fingerprint 2"
                                description="Place your second finger on the scanner."
                                isCompleted={
                                    fingerprintState.finger2ScanCompleted
                                }
                                isEnabled={
                                    currentStep === "finger2-scan" &&
                                    !!macAddress
                                }
                                onAction={() =>
                                    handleStartScanning("finger2-scan")
                                }
                                onEdit={() =>
                                    handleEditFingerprint("finger2-scan")
                                }
                                actionText="Start Scanning"
                            />

                            <FingerprintCard
                                title="Rescan Fingerprint 2"
                                description="Please scan your second finger again to confirm."
                                isCompleted={
                                    fingerprintState.finger2RescanCompleted
                                }
                                isEnabled={
                                    currentStep === "finger2-rescan" &&
                                    !!macAddress
                                }
                                onAction={() =>
                                    handleStartScanning("finger2-rescan")
                                }
                                onEdit={() =>
                                    handleEditFingerprint("finger2-rescan")
                                }
                                actionText="Validate Fingerprint"
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={handleClose}
                ></div>

                <div className="bg-[#f5f5f5] rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl p-5">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-2xl font-semibold text-black">
                            Fingerprint Setup
                        </h2>
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 flex items-center justify-center rounded-md border border-black hover:scale-105 transition-all"
                        >
                            <X className="h-4 w-4 text-gray-600" />
                        </button>
                    </div>

                    {renderStepContent()}

                    {currentStep === "employee-selection" &&
                        fingerprintState.finger1ScanCompleted && (
                            <div className="flex gap-4 justify-end p-6 border-t">
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    className="px-8 border-[#003DF6] text-[#003DF6] hover:text-blue-800 h-[44px]"
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleClose}
                                    className="px-8 border-gray-400 text-gray-600 hover:text-gray-800 h-[44px]"
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                </div>
            </div>

            <FingerprintScanningDialog
                isOpen={scanState.isDialogOpen}
                onClose={closeScanDialog}
                onComplete={handleScanComplete}
                scanningType={scanState.scanningType}
                isApiProcessing={scanState.isApiProcessing}
            />
        </>
    );
};

export default FingerprintSetupDialog;
