// app/dashboard/_components/FingerprintSetupDialog.tsx - FIXED WITH INFINITE SCROLL
"use client";

import { FC, useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmployeeDropdown from "@/components/shared/EmployeeDropdown";
import FingerprintCard from "@/components/shared/FingerprintCard";
import FingerprintScanningDialog from "@/components/shared/FingerprintScanningDialog";
import { useEmployeesInfinite } from "@/hooks/useEmployeesInfinite";
import { useAuthManager } from "@/components/shared/AuthenticationManager";
import EmployeeLoginDialog from "@/components/shared/EmployeeLoginDialog";
import { UserData } from "@/types/user";
import { showErrorAlert, showSuccessAlert } from "@/lib/swal";

interface FingerprintSetupDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: () => void;
}

interface FingerprintSetupState {
    selectedEmployee: UserData | null;
    isDropdownOpen: boolean;
    scanningState: {
        isOpen: boolean;
        type:
            | "finger1-scan"
            | "finger1-rescan"
            | "finger2-scan"
            | "finger2-rescan"
            | "";
        isProcessing: boolean;
    };
    fingerprintData: {
        finger1: boolean;
        finger2: boolean;
    };
}

const FingerprintSetupDialog: FC<FingerprintSetupDialogProps> = ({
    isOpen,
    onClose,
    onRegister,
}) => {
    // Authentication Manager
    const {
        authState,
        checkAuthentication,
        handleLoginSuccess,
        handleLoginClose,
        resetAuth,
    } = useAuthManager();

    // Infinite scroll employees hook
    const {
        employees,
        filteredEmployees,
        isLoading,
        isLoadingMore,
        error,
        hasMoreData,
        totalCount,
        searchTerm,
        setSearchTerm,
        loadMore,
        refetch,
        isSessionExpired,
    } = useEmployeesInfinite({
        limit: 15, // Load 15 employees per page
        enabled: authState.hasValidToken && isOpen,
    });

    // Component state
    const [state, setState] = useState<FingerprintSetupState>({
        selectedEmployee: null,
        isDropdownOpen: false,
        scanningState: {
            isOpen: false,
            type: "",
            isProcessing: false,
        },
        fingerprintData: {
            finger1: false,
            finger2: false,
        },
    });

    // Check authentication when dialog opens
    useEffect(() => {
        if (isOpen && !authState.hasValidToken && !authState.isCheckingAuth) {
            checkAuthentication();
        }
    }, [
        isOpen,
        authState.hasValidToken,
        authState.isCheckingAuth,
        checkAuthentication,
    ]);

    // Handle session expired from employee fetch
    useEffect(() => {
        if (isSessionExpired) {
            resetAuth();
        }
    }, [isSessionExpired, resetAuth]);

    // Reset state when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setState({
                selectedEmployee: null,
                isDropdownOpen: false,
                scanningState: {
                    isOpen: false,
                    type: "",
                    isProcessing: false,
                },
                fingerprintData: {
                    finger1: false,
                    finger2: false,
                },
            });
            setSearchTerm("");
        }
    }, [isOpen, setSearchTerm]);

    const handleEmployeeSelect = (employee: UserData) => {
        console.log("👤 Employee selected:", employee);
        setState((prev) => ({
            ...prev,
            selectedEmployee: employee,
            isDropdownOpen: false,
            fingerprintData: {
                finger1: !!employee.fingerprint1Exist,
                finger2: !!employee.fingerprint2Exist,
            },
        }));
        setSearchTerm("");
    };

    const handleDropdownToggle = () => {
        setState((prev) => ({
            ...prev,
            isDropdownOpen: !prev.isDropdownOpen,
        }));
    };

    const handleRetry = () => {
        console.log("🔄 Retrying employee fetch...");
        refetch();
    };

    const startScanning = (
        type:
            | "finger1-scan"
            | "finger1-rescan"
            | "finger2-scan"
            | "finger2-rescan"
    ) => {
        console.log("🔍 Starting fingerprint scan:", type);
        setState((prev) => ({
            ...prev,
            scanningState: {
                isOpen: true,
                type,
                isProcessing: true,
            },
        }));

        // Simulate fingerprint scanning process
        setTimeout(() => {
            setState((prev) => ({
                ...prev,
                scanningState: {
                    ...prev.scanningState,
                    isProcessing: false,
                },
            }));
        }, 3000);
    };

    const handleScanComplete = async () => {
        const { type } = state.scanningState;

        try {
            // Update fingerprint data based on scan type
            if (type === "finger1-scan" || type === "finger1-rescan") {
                setState((prev) => ({
                    ...prev,
                    fingerprintData: {
                        ...prev.fingerprintData,
                        finger1: true,
                    },
                    scanningState: {
                        isOpen: false,
                        type: "",
                        isProcessing: false,
                    },
                }));

                await showSuccessAlert(
                    "Success!",
                    "Fingerprint 1 registered successfully",
                    1500
                );
            } else if (type === "finger2-scan" || type === "finger2-rescan") {
                setState((prev) => ({
                    ...prev,
                    fingerprintData: {
                        ...prev.fingerprintData,
                        finger2: true,
                    },
                    scanningState: {
                        isOpen: false,
                        type: "",
                        isProcessing: false,
                    },
                }));

                await showSuccessAlert(
                    "Success!",
                    "Fingerprint 2 registered successfully",
                    1500
                );
            }

            // Check if both fingerprints are completed
            const updatedFingerprintData = {
                finger1: type.includes("finger1")
                    ? true
                    : state.fingerprintData.finger1,
                finger2: type.includes("finger2")
                    ? true
                    : state.fingerprintData.finger2,
            };

            if (
                updatedFingerprintData.finger1 &&
                updatedFingerprintData.finger2
            ) {
                setTimeout(() => {
                    onRegister();
                    onClose();
                }, 500);
            }
        } catch (error) {
            console.error("❌ Error completing scan:", error);
            await showErrorAlert(
                "Scan Error",
                "Failed to complete fingerprint scan. Please try again.",
                "OK"
            );
        }
    };

    const handleScanClose = () => {
        setState((prev) => ({
            ...prev,
            scanningState: {
                isOpen: false,
                type: "",
                isProcessing: false,
            },
        }));
    };

    const handleClose = () => {
        setState((prev) => ({
            ...prev,
            selectedEmployee: null,
            isDropdownOpen: false,
            scanningState: {
                isOpen: false,
                type: "",
                isProcessing: false,
            },
            fingerprintData: {
                finger1: false,
                finger2: false,
            },
        }));
        setSearchTerm("");
        onClose();
    };

    if (!isOpen) return null;

    // Show login dialog if not authenticated
    if (!authState.hasValidToken) {
        return (
            <EmployeeLoginDialog
                isOpen={authState.isLoginDialogOpen}
                onClose={handleLoginClose}
                onLogin={handleLoginSuccess}
            />
        );
    }

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={handleClose}
                ></div>

                <div className="bg-[#f5f5f5] rounded-2xl w-full max-w-2xl relative z-10 p-6">
                    <div className="flex justify-between items-center mb-6">
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

                    {/* Employee Dropdown with Infinite Scroll */}
                    <EmployeeDropdown
                        employees={filteredEmployees}
                        isLoading={isLoading}
                        error={error}
                        isOpen={state.isDropdownOpen}
                        selectedName={state.selectedEmployee?.fullname || ""}
                        searchTerm={searchTerm}
                        onToggle={handleDropdownToggle}
                        onSelect={handleEmployeeSelect}
                        onSearchChange={setSearchTerm}
                        onRetry={handleRetry}
                        isAuthenticated={authState.hasValidToken}
                        hasMoreData={hasMoreData}
                        isLoadingMore={isLoadingMore}
                        onLoadMore={loadMore}
                        totalCount={totalCount}
                    />

                    {/* Fingerprint Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <FingerprintCard
                            title="Fingerprint 1"
                            description="Register your primary fingerprint for secure access"
                            isCompleted={state.fingerprintData.finger1}
                            isEnabled={!!state.selectedEmployee}
                            onAction={() =>
                                startScanning(
                                    state.fingerprintData.finger1
                                        ? "finger1-rescan"
                                        : "finger1-scan"
                                )
                            }
                            onEdit={() => startScanning("finger1-rescan")}
                            actionText={
                                state.fingerprintData.finger1
                                    ? "Re-scan"
                                    : "Start Scanning"
                            }
                        />

                        <FingerprintCard
                            title="Fingerprint 2"
                            description="Register your secondary fingerprint as backup"
                            isCompleted={state.fingerprintData.finger2}
                            isEnabled={
                                !!state.selectedEmployee &&
                                state.fingerprintData.finger1
                            }
                            onAction={() =>
                                startScanning(
                                    state.fingerprintData.finger2
                                        ? "finger2-rescan"
                                        : "finger2-scan"
                                )
                            }
                            onEdit={() => startScanning("finger2-rescan")}
                            actionText={
                                state.fingerprintData.finger2
                                    ? "Re-scan"
                                    : "Start Scanning"
                            }
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                onRegister();
                                handleClose();
                            }}
                            disabled={
                                !state.fingerprintData.finger1 ||
                                !state.fingerprintData.finger2
                            }
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
                        >
                            Complete Setup
                        </Button>
                    </div>
                </div>
            </div>

            {/* Fingerprint Scanning Dialog */}
            <FingerprintScanningDialog
                isOpen={state.scanningState.isOpen}
                onClose={handleScanClose}
                onComplete={handleScanComplete}
                scanningType={state.scanningState.type}
                isApiProcessing={state.scanningState.isProcessing}
            />
        </>
    );
};

export default FingerprintSetupDialog;
