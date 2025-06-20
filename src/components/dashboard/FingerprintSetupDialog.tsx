// components/dashboard/FingerprintSetupDialog.tsx - REFACTORED VERSION
"use client";

import { FC, useState, useEffect, useCallback } from "react";
import { X, ChevronDown, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmployeeLoginDialog from "../shared/EmployeeLoginDialog";
import FingerprintScanningDialog from "../shared/FingerprintScanningDialog";
import { useUser } from "@/hooks/useUser";
import { UserData, FingerprintSetupData } from "@/types/user";
import { showErrorAlert } from "@/lib/swal";
import Swal from 'sweetalert2';

// ====================== TYPES ======================

interface FingerprintSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
}

type FingerprintStep = 
  | 'employee-selection' 
  | 'finger1-scan' 
  | 'finger1-rescan' 
  | 'finger1-complete' 
  | 'finger2-scan' 
  | 'finger2-rescan' 
  | 'complete';

type ScanningType = 
  | 'finger1-scan' 
  | 'finger1-rescan' 
  | 'finger2-scan' 
  | 'finger2-rescan' 
  | '';

interface FingerprintState {
  finger1ScanCompleted: boolean;
  finger1RescanCompleted: boolean;
  finger2ScanCompleted: boolean;
  finger2RescanCompleted: boolean;
}

interface AuthState {
  hasValidToken: boolean;
  isLoginDialogOpen: boolean;
  isCheckingAuth: boolean;
}

interface EmployeeState {
  selectedEmployeeId: number | null;
  selectedEmployeeName: string;
  showDropdown: boolean;
}

interface ScanState {
  isDialogOpen: boolean;
  scanningType: ScanningType;
}

// ====================== HOOKS ======================
const useAuthManager = () => {
  const [authState, setAuthState] = useState<AuthState>({
    hasValidToken: false,
    isLoginDialogOpen: false,
    isCheckingAuth: true
  });

  const checkAuthentication = useCallback(async () => {
    console.log('🔍 Checking authentication status...');
    setAuthState(prev => ({ ...prev, isCheckingAuth: true }));
    
    try {
      const response = await fetch('/api/user?limit=1&offset=0', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        console.log('✅ User authenticated');
        setAuthState(prev => ({ 
          ...prev, 
          hasValidToken: true, 
          isCheckingAuth: false 
        }));
      } else {
        console.log('❌ User not authenticated');
        setAuthState(prev => ({ 
          ...prev, 
          hasValidToken: false, 
          isCheckingAuth: false 
        }));
        showSessionExpiredDialog();
      }
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      setAuthState(prev => ({ 
        ...prev, 
        hasValidToken: false, 
        isCheckingAuth: false 
      }));
      showSessionExpiredDialog();
    }
  }, []); // ✅ Empty deps - stable function

  const showSessionExpiredDialog = useCallback(() => {
    Swal.fire({
      icon: 'warning',
      title: 'Session Expired',
      html: `
        <div class="text-sm text-gray-600 mb-4">
          Your session has expired. Please login again to continue.
        </div>
        <div class="text-xs text-gray-500">
          Auto-closing in <strong id="timer">3</strong> seconds
        </div>
      `,
      timer: 3000,
      timerProgressBar: true,
      confirmButtonText: 'Login Now',
      confirmButtonColor: '#025CCA',
      allowOutsideClick: false,
      didOpen: () => {
        const timer = Swal.getPopup()?.querySelector('#timer');
        let remainingTime = 3;
        const interval = setInterval(() => {
          remainingTime--;
          if (timer) timer.textContent = remainingTime.toString();
          if (remainingTime <= 0) clearInterval(interval);
        }, 1000);
      }
    }).then(() => {
      setAuthState(prev => ({ ...prev, isLoginDialogOpen: true }));
    });
  }, []);

  const handleLoginSuccess = useCallback((userData: any) => {
    console.log('✅ Login successful:', userData);
    setAuthState({
      hasValidToken: true,
      isLoginDialogOpen: false,
      isCheckingAuth: false
    });
  }, []);

  const handleLoginClose = useCallback(() => {
    setAuthState(prev => ({ ...prev, isLoginDialogOpen: false }));
  }, []);

  const resetAuth = useCallback(() => {
    setAuthState({
      hasValidToken: false,
      isLoginDialogOpen: false,
      isCheckingAuth: true
    });
  }, []);

  return {
    authState,
    checkAuthentication,
    handleLoginSuccess,
    handleLoginClose,
    resetAuth
  };
};

const useFingerprintFlow = () => {
  const [currentStep, setCurrentStep] = useState<FingerprintStep>('employee-selection');
  const [fingerprintState, setFingerprintState] = useState<FingerprintState>({
    finger1ScanCompleted: false,
    finger1RescanCompleted: false,
    finger2ScanCompleted: false,
    finger2RescanCompleted: false
  });

  const updateFingerprintState = (updates: Partial<FingerprintState>) => {
    setFingerprintState(prev => ({ ...prev, ...updates }));
  };

  const resetFlow = () => {
    setCurrentStep('employee-selection');
    setFingerprintState({
      finger1ScanCompleted: false,
      finger1RescanCompleted: false,
      finger2ScanCompleted: false,
      finger2RescanCompleted: false
    });
  };

  return {
    currentStep,
    setCurrentStep,
    fingerprintState,
    updateFingerprintState,
    resetFlow
  };
};

const useEmployeeSelection = () => {
  const [employeeState, setEmployeeState] = useState<EmployeeState>({
    selectedEmployeeId: null,
    selectedEmployeeName: '',
    showDropdown: false
  });

  const { 
    userList: employees, 
    isLoading, 
    error, 
    refetch 
  } = useUser({ limit: 50, offset: 0 });

  const selectEmployee = useCallback((employee: UserData) => {
    setEmployeeState({
      selectedEmployeeId: employee.id,
      selectedEmployeeName: employee.fullname,
      showDropdown: false
    });
  }, []);

  const toggleDropdown = useCallback(() => {
    if (!isLoading) {
      setEmployeeState(prev => ({ 
        ...prev, 
        showDropdown: !prev.showDropdown 
      }));
    }
  }, [isLoading]);

  const resetEmployee = useCallback(() => {
    setEmployeeState({
      selectedEmployeeId: null,
      selectedEmployeeName: '',
      showDropdown: false
    });
  }, []);

  return {
    employeeState,
    employees,
    isLoading,
    error,
    selectEmployee,
    toggleDropdown,
    resetEmployee,
    refetch
  };
};

const useScanningManager = () => {
  const [scanState, setScanState] = useState<ScanState>({
    isDialogOpen: false,
    scanningType: ''
  });

  const startScanning = (type: ScanningType) => {
    setScanState({
      isDialogOpen: true,
      scanningType: type
    });
  };

  const closeScanDialog = () => {
    setScanState({
      isDialogOpen: false,
      scanningType: ''
    });
  };

  return {
    scanState,
    startScanning,
    closeScanDialog
  };
};

// ====================== COMPONENTS ======================
const LoadingScreen: FC = () => (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="absolute inset-0 bg-black/50"></div>
    <div className="bg-white rounded-lg p-8 relative z-10">
      <div className="flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span>Checking authentication for fingerprint setup...</span>
      </div>
    </div>
  </div>
);

interface EmployeeDropdownProps {
  employees: UserData[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  selectedName: string;
  onToggle: () => void;
  onSelect: (employee: UserData) => void;
  onRetry: () => void;
}

const EmployeeDropdown: FC<EmployeeDropdownProps> = ({
  employees,
  isLoading,
  error,
  isOpen,
  selectedName,
  onToggle,
  onSelect,
  onRetry
}) => (
  <div className="mb-6">
    <label className="block text-gray-800 mb-2 font-medium">
      Employee Name
    </label>
    <div className="relative">
      <button
        onClick={onToggle}
        disabled={isLoading}
        className={`w-full flex justify-between items-center text-left rounded-md py-4 px-4 transition-colors ${
          isLoading 
            ? 'bg-gray-100 cursor-not-allowed'
            : 'bg-[#F5F5F5] hover:bg-gray-200'
        }`}
      >
        <span className={selectedName ? "text-gray-800" : "text-gray-500"}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading employees...
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-4 w-4" />
              Error loading data
            </div>
          ) : (
            selectedName || "Select User"
          )}
        </span>
        <ChevronDown className="h-5 w-5 text-gray-500" />
      </button>
      
      {isOpen && !isLoading && !error && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto mt-1">
          {employees.length > 0 ? (
            employees.map((employee) => (
              <button
                key={employee.id}
                onClick={() => onSelect(employee)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0 transition-colors"
              >
                <div className="font-medium">{employee.fullname}</div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              No employees found
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-2">
          <p className="text-red-500 text-xs flex-1">
            {error.includes('Session expired') 
              ? 'Authentication required. Please login again.' 
              : 'Failed to load employee data. Please try again.'
            }
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="text-xs h-7 px-2"
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  </div>
);

interface FingerprintCardProps {
  title: string;
  description: string;
  isCompleted: boolean;
  isEnabled: boolean;
  onAction: () => void;
  actionText?: string;
}

const FingerprintCard: FC<FingerprintCardProps> = ({
  title,
  description,
  isCompleted,
  isEnabled,
  onAction,
  actionText = "Start Scanning"
}) => (
  <div className={`bg-white rounded-lg border p-6 flex flex-col items-center transition-opacity ${
    !isEnabled ? 'opacity-50' : ''
  }`}>
    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
      {isCompleted ? (
        <CheckCircle className="h-8 w-8 text-green-600" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
          />
        </svg>
      )}
    </div>
    <h3 className="text-lg font-medium mb-3 text-center">{title}</h3>
    <p className="text-gray-600 text-center mb-6 text-sm">{description}</p>
    
    <Button 
      onClick={onAction}
      disabled={!isEnabled}
      className={`w-full transition-all duration-200 ${
        isCompleted
          ? 'bg-green-500 hover:bg-green-600 cursor-default'
          : isEnabled
          ? 'bg-blue-600 hover:bg-blue-700'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
    >
      {isCompleted ? 'Success Added' : actionText}
    </Button>
  </div>
);

// ====================== MAIN COMPONENT ======================
const FingerprintSetupDialog: FC<FingerprintSetupDialogProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  // Custom hooks
  const { authState, checkAuthentication, handleLoginSuccess, handleLoginClose, resetAuth } = useAuthManager();
  const { currentStep, setCurrentStep, fingerprintState, updateFingerprintState, resetFlow } = useFingerprintFlow();
  const { employeeState, employees, isLoading, error, selectEmployee, toggleDropdown, resetEmployee, refetch } = useEmployeeSelection();
  const { scanState, startScanning, closeScanDialog } = useScanningManager();

  // Effects
  useEffect(() => {
    if (isOpen) {
      checkAuthentication();
    }
  }, [isOpen, checkAuthentication]);

  useEffect(() => {
    if (authState.hasValidToken) {
      // Only refetch once when authentication is successful
      const timeoutId = setTimeout(() => {
        refetch();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [authState.hasValidToken]); // ❌ Removed refetch from deps

  // Handlers
  const handleStartScanning = (type: ScanningType) => {
    startScanning(type);
    setCurrentStep(type as FingerprintStep);
  };

  const handleScanComplete = () => {
    switch (scanState.scanningType) {
      case 'finger1-scan':
        updateFingerprintState({ finger1ScanCompleted: true });
        setCurrentStep('finger1-rescan');
        break;
      case 'finger1-rescan':
        updateFingerprintState({ finger1RescanCompleted: true });
        setCurrentStep('finger1-complete');
        break;
      case 'finger2-scan':
        updateFingerprintState({ finger2ScanCompleted: true });
        setCurrentStep('finger2-rescan');
        break;
      case 'finger2-rescan':
        updateFingerprintState({ finger2RescanCompleted: true });
        setCurrentStep('complete');
        handleFinalSubmit();
        break;
    }
    closeScanDialog();
  };

  const handleNext = () => {
    setCurrentStep('finger2-scan');
  };

  const handleFinalSubmit = async () => {
    if (!employeeState.selectedEmployeeId) return;

    try {
      console.log('🚀 Starting final submission...');

      const fingerprintData = (fingerprintNumber: 1 | 2): FingerprintSetupData => ({
        user_id: employeeState.selectedEmployeeId!,
        mac_address: "84-1B-77-FD-31-35",
        number_of_fingerprint: fingerprintNumber
      });

      // Submit both fingerprints
      const responses = await Promise.all([
        fetch('/api/fingerprint/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(fingerprintData(1)),
        }),
        fetch('/api/fingerprint/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(fingerprintData(2)),
        })
      ]);

      // Check responses
      for (const response of responses) {
        if (!response.ok) {
          if (response.status === 401) {
            resetAuth();
            return;
          }
          const result = await response.json();
          throw new Error(result.message || 'Failed to save fingerprint');
        }
      }

      console.log('✅ Both fingerprints setup successful');
      await showSuccessDialog();
      
    } catch (error) {
      console.error('❌ Error saving fingerprints:', error);
      await showErrorAlert(
        'Setup Failed',
        error instanceof Error ? error.message : 'Failed to save fingerprint data. Please try again.',
        'OK'
      );
    }
  };

  const showSuccessDialog = async () => {
    return Swal.fire({
      icon: 'success',
      title: 'Fingerprint Success Added!',
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
        const countdown = Swal.getPopup()?.querySelector('#countdown');
        let remainingTime = 3;
        const interval = setInterval(() => {
          remainingTime--;
          if (countdown) countdown.textContent = remainingTime.toString();
          if (remainingTime <= 0) clearInterval(interval);
        }, 1000);
      }
    }).then(() => {
      handleReset();
      onRegister();
      onClose();
    });
  };

  const handleReset = () => {
    resetFlow();
    resetEmployee();
  };

  const handleClose = () => {
    handleReset();
    resetAuth();
    onClose();
  };

  // Render guards
  if (!isOpen) return null;

  if (authState.isCheckingAuth) {
    return <LoadingScreen />;
  }

  if (!authState.hasValidToken) {
    return (
      <EmployeeLoginDialog
        isOpen={authState.isLoginDialogOpen}
        onClose={handleLoginClose}
        onLogin={handleLoginSuccess}
      />
    );
  }

  // Step content renderer
  const renderStepContent = () => {
    switch (currentStep) {
      case 'employee-selection':
        return (
          <div className="p-6">
            <EmployeeDropdown
              employees={employees}
              isLoading={isLoading}
              error={error}
              isOpen={employeeState.showDropdown}
              selectedName={employeeState.selectedEmployeeName}
              onToggle={toggleDropdown}
              onSelect={selectEmployee}
              onRetry={refetch}
            />

            <div className="grid grid-cols-2 gap-6">
              <FingerprintCard
                title="Scan Fingerprint 1"
                description="Place your finger on the scanner to start registration."
                isCompleted={fingerprintState.finger1ScanCompleted}
                isEnabled={!!employeeState.selectedEmployeeId}
                onAction={() => handleStartScanning('finger1-scan')}
              />
              
              <FingerprintCard
                title="Rescan Fingerprint 1"
                description="Please scan your finger again to confirm your identity."
                isCompleted={fingerprintState.finger1RescanCompleted}
                isEnabled={fingerprintState.finger1ScanCompleted}
                onAction={() => handleStartScanning('finger1-rescan')}
              />
            </div>
          </div>
        );

      case 'finger1-scan':
      case 'finger1-rescan':
        return (
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Fingerprint 1 Setup</h3>
              <p className="text-gray-600">Employee: <strong>{employeeState.selectedEmployeeName}</strong></p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FingerprintCard
                title="Scan Fingerprint 1"
                description="Place your finger on the scanner to start registration."
                isCompleted={fingerprintState.finger1ScanCompleted}
                isEnabled={currentStep === 'finger1-scan'}
                onAction={() => handleStartScanning('finger1-scan')}
              />
              
              <FingerprintCard
                title="Rescan Fingerprint 1"
                description="Please scan your finger again to confirm your identity."
                isCompleted={fingerprintState.finger1RescanCompleted}
                isEnabled={currentStep === 'finger1-rescan'}
                onAction={() => handleStartScanning('finger1-rescan')}
              />
            </div>
          </div>
        );

      case 'finger1-complete':
        return (
          <div className="p-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fingerprint 1 Complete!</h3>
              <p className="text-gray-600">Ready to setup Fingerprint 2 for <strong>{employeeState.selectedEmployeeName}</strong></p>
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

      case 'finger2-scan':
      case 'finger2-rescan':
        return (
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Fingerprint 2 Setup</h3>
              <p className="text-gray-600">Employee: <strong>{employeeState.selectedEmployeeName}</strong></p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FingerprintCard
                title="Scan Fingerprint 2"
                description="Place your second finger on the scanner."
                isCompleted={fingerprintState.finger2ScanCompleted}
                isEnabled={currentStep === 'finger2-scan'}
                onAction={() => handleStartScanning('finger2-scan')}
              />
              
              <FingerprintCard
                title="Rescan Fingerprint 2"
                description="Please scan your second finger again to confirm."
                isCompleted={fingerprintState.finger2RescanCompleted}
                isEnabled={currentStep === 'finger2-rescan'}
                onAction={() => handleStartScanning('finger2-rescan')}
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
        <div className="absolute inset-0 bg-black/50" onClick={handleClose}></div>

        <div className="bg-white rounded-lg w-full max-w-2xl relative z-10">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-[#202325]">
              Fingerprint Setup
            </h2>
            <button onClick={handleClose}>
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {renderStepContent()}

          {currentStep === 'employee-selection' && (
            <div className="flex gap-4 justify-end p-6 border-t">
              <Button
                variant="outline"
                onClick={handleReset}
                className="px-8 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Reset
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
      />
    </>
  );
};

export default FingerprintSetupDialog;