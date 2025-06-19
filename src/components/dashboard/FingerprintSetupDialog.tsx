// components/dashboard/FingerprintSetupDialog.tsx - NEW FLOW VERSION
"use client";

import { FC, useState, useEffect } from "react";
import { X, ChevronDown, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmployeeLoginDialog from "../shared/EmployeeLoginDialog";
import FingerprintScanningDialog from "../shared/FingerprintScanningDialog";
import { useUser } from "@/hooks/useUser";
import { UserData, FingerprintSetupData } from "@/types/user";
import { showSuccessAlert, showErrorAlert } from "@/lib/swal";
import Swal from 'sweetalert2';

interface FingerprintSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
}

type FingerprintStep = 'employee-selection' | 'finger1-scan' | 'finger1-rescan' | 'finger1-complete' | 'finger2-scan' | 'finger2-rescan' | 'complete';
type ScanningType = 'finger1-scan' | 'finger1-rescan' | 'finger2-scan' | 'finger2-rescan' | '';

const FingerprintSetupDialog: FC<FingerprintSetupDialogProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  // Authentication states
  const [hasValidToken, setHasValidToken] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Use custom hook for user data
  const { userList: employees, isLoading: isLoadingEmployees, error: employeeError, refetch: refetchEmployees } = useUser({
    limit: 50,
    offset: 0
  });

  // NEW FLOW: Step-based state management
  const [currentStep, setCurrentStep] = useState<FingerprintStep>('employee-selection');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  
  // Scanning states
  const [isScanningDialogOpen, setIsScanningDialogOpen] = useState(false);
  const [scanningType, setScanningType] = useState<ScanningType>('');
  
  // Fingerprint completion tracking
  const [finger1ScanCompleted, setFinger1ScanCompleted] = useState(false);
  const [finger1RescanCompleted, setFinger1RescanCompleted] = useState(false);
  const [finger2ScanCompleted, setFinger2ScanCompleted] = useState(false);
  const [finger2RescanCompleted, setFinger2RescanCompleted] = useState(false);

  // Check authentication when dialog opens
  useEffect(() => {
    if (isOpen) {
      checkAuthenticationStatus();
    }
  }, [isOpen]);

  // API-based authentication check
  const checkAuthenticationStatus = async () => {
    console.log('🔍 FINGERPRINT SETUP - CHECKING AUTHENTICATION STATUS...');
    setIsCheckingAuth(true);
    
    try {
      const response = await fetch('/api/user?limit=1&offset=0', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('🔍 Fingerprint Auth API Test Response status:', response.status);
      
      if (response.ok) {
        console.log('✅ USER ALREADY AUTHENTICATED');
        setHasValidToken(true);
        setIsCheckingAuth(false);
        
        setTimeout(() => {
          refetchEmployees();
        }, 500);
      } else if (response.status === 401) {
        console.log('❌ USER NOT AUTHENTICATED');
        setHasValidToken(false);
        setIsCheckingAuth(false);
        showSessionExpiredPopup();
      } else {
        console.log('⚠️ API ERROR');
        setHasValidToken(false);
        setIsCheckingAuth(false);
        showSessionExpiredPopup();
      }
    } catch (error) {
      console.log('❌ NETWORK ERROR:', error);
      setHasValidToken(false);
      setIsCheckingAuth(false);
      showSessionExpiredPopup();
    }
  };

  // Session expired popup
  const showSessionExpiredPopup = () => {
    console.log('⚠️ Fingerprint Setup - Showing session expired popup');
    
    let timerInterval: NodeJS.Timeout;
    
    Swal.fire({
      icon: 'warning',
      title: 'Session Expired',
      html: `
        <div class="text-sm text-gray-600 mb-4">
          Your session has expired. Please login again to continue with fingerprint setup.
        </div>
        <div class="text-xs text-gray-500">
          This popup will close automatically in <strong id="timer">3</strong> seconds
        </div>
      `,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: true,
      confirmButtonText: 'Login Now',
      confirmButtonColor: '#025CCA',
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        confirmButton: 'rounded-lg px-6 py-2 font-medium',
        title: 'text-lg font-bold text-red-600',
        htmlContainer: 'text-sm',
      },
      background: '#ffffff',
      color: '#1f2937',
      didOpen: () => {
        const timer = Swal.getPopup()?.querySelector('#timer');
        let remainingTime = 3;
        
        timerInterval = setInterval(() => {
          remainingTime--;
          if (timer) {
            timer.textContent = remainingTime.toString();
          }
          
          if (remainingTime <= 0) {
            clearInterval(timerInterval);
          }
        }, 1000);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
        setIsLoginDialogOpen(true);
      }
    });
  };

  // Handle successful login
  const handleLoginSuccess = (userData: any) => {
    console.log('✅ Fingerprint Setup - Login successful:', userData);
    setHasValidToken(true);
    setIsLoginDialogOpen(false);
    
    setTimeout(() => {
      refetchEmployees();
    }, 1000);
  };

  // Handle login dialog close
  const handleLoginClose = () => {
    console.log('❌ Fingerprint Setup - Login dialog closed without login');
    setIsLoginDialogOpen(false);
    onClose();
  };

  // Handle employee selection
  const handleEmployeeSelect = (employee: UserData) => {
    setSelectedEmployeeId(employee.id);
    setSelectedEmployeeName(employee.fullname);
    setShowEmployeeDropdown(false);
    // Don't change step immediately - stay on employee-selection to show activated cards
  };

  // Handle start scanning
  const handleStartScanning = (type: ScanningType) => {
    setScanningType(type);
    setIsScanningDialogOpen(true);
    
    // Update step based on scanning type
    switch (type) {
      case 'finger1-scan':
        setCurrentStep('finger1-scan');
        break;
      case 'finger1-rescan':
        setCurrentStep('finger1-rescan');
        break;
      case 'finger2-scan':
        setCurrentStep('finger2-scan');
        break;
      case 'finger2-rescan':
        setCurrentStep('finger2-rescan');
        break;
    }
  };

  // Handle scan completion
  const handleScanComplete = () => {
    switch (scanningType) {
      case 'finger1-scan':
        setFinger1ScanCompleted(true);
        setCurrentStep('finger1-rescan');
        break;
      case 'finger1-rescan':
        setFinger1RescanCompleted(true);
        setCurrentStep('finger1-complete');
        break;
      case 'finger2-scan':
        setFinger2ScanCompleted(true);
        setCurrentStep('finger2-rescan');
        break;
      case 'finger2-rescan':
        setFinger2RescanCompleted(true);
        setCurrentStep('complete');
        handleFinalSubmit();
        break;
    }
    setIsScanningDialogOpen(false);
    setScanningType('');
  };

  // Handle next button (after finger 1 complete)
  const handleNext = () => {
    setCurrentStep('finger2-scan');
  };

  // Handle final submission
  const handleFinalSubmit = async () => {
    if (!selectedEmployeeId) return;

    try {
      console.log('🚀 Fingerprint Setup - Starting final submission...');

      // Submit fingerprint 1
      const fingerprint1Data: FingerprintSetupData = {
        user_id: selectedEmployeeId,
        mac_address: "84-1B-77-FD-31-35",
        number_of_fingerprint: 1
      };

      const response1 = await fetch('/api/fingerprint/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(fingerprint1Data),
      });

      if (!response1.ok) {
        if (response1.status === 401) {
          setHasValidToken(false);
          showSessionExpiredPopup();
          return;
        }
        const result1 = await response1.json();
        throw new Error(result1.message || 'Failed to save fingerprint 1');
      }

      // Submit fingerprint 2
      const fingerprint2Data: FingerprintSetupData = {
        user_id: selectedEmployeeId,
        mac_address: "84-1B-77-FD-31-35",
        number_of_fingerprint: 2
      };

      const response2 = await fetch('/api/fingerprint/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(fingerprint2Data),
      });

      if (!response2.ok) {
        if (response2.status === 401) {
          setHasValidToken(false);
          showSessionExpiredPopup();
          return;
        }
        const result2 = await response2.json();
        throw new Error(result2.message || 'Failed to save fingerprint 2');
      }

      console.log('✅ Both fingerprints setup successful');
      
      // Show success popup and redirect
      await showFingerprintSuccessPopup();
      
    } catch (error) {
      console.error('❌ Error saving fingerprints:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        await showErrorAlert(
          'Network Error',
          'Unable to connect to server. Please check your connection.',
          'OK'
        );
      } else {
        await showErrorAlert(
          'Setup Failed',
          error instanceof Error ? error.message : 'Failed to save fingerprint data. Please try again.',
          'OK'
        );
      }
    }
  };

  // Show fingerprint success popup with auto-redirect
  const showFingerprintSuccessPopup = async () => {
    return Swal.fire({
      icon: 'success',
      title: 'Fingerprint Success Added!',
      html: `
        <div class="text-sm text-gray-600 mb-4">
          Both fingerprints have been successfully registered for ${selectedEmployeeName}.
        </div>
        <div class="text-xs text-gray-500">
          Redirecting to dashboard in <strong id="countdown">3</strong> seconds...
        </div>
      `,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-lg font-bold text-green-600',
        htmlContainer: 'text-sm',
      },
      background: '#ffffff',
      color: '#1f2937',
      didOpen: () => {
        const countdown = Swal.getPopup()?.querySelector('#countdown');
        let remainingTime = 3;
        
        const countdownInterval = setInterval(() => {
          remainingTime--;
          if (countdown) {
            countdown.textContent = remainingTime.toString();
          }
          
          if (remainingTime <= 0) {
            clearInterval(countdownInterval);
          }
        }, 1000);
      }
    }).then(() => {
      // Reset all states and close dialog
      handleReset();
      onRegister();
      onClose();
    });
  };

  // Handle reset
  const handleReset = () => {
    setCurrentStep('employee-selection');
    setSelectedEmployeeId(null);
    setSelectedEmployeeName("");
    setFinger1ScanCompleted(false);
    setFinger1RescanCompleted(false);
    setFinger2ScanCompleted(false);
    setFinger2RescanCompleted(false);
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    handleReset();
    setHasValidToken(false);
    setIsCheckingAuth(true);
    onClose();
  };

  if (!isOpen) return null;

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
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
  }

  // Show login dialog if no valid token
  if (!hasValidToken) {
    return (
      <EmployeeLoginDialog
        isOpen={isLoginDialogOpen}
        onClose={handleLoginClose}
        onLogin={handleLoginSuccess}
      />
    );
  }

  // Render step-based content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'employee-selection':
        return (
          <div className="p-6">
            {/* Employee Selection */}
            <div className="mb-6">
              <label className="block text-gray-800 mb-2 font-medium">
                Employee Name
              </label>
              <div className="relative">
                <button
                  onClick={() => !isLoadingEmployees && setShowEmployeeDropdown(!showEmployeeDropdown)}
                  disabled={isLoadingEmployees}
                  className={`w-full flex justify-between items-center text-left rounded-md py-4 px-4 transition-colors ${
                    isLoadingEmployees 
                      ? 'bg-gray-100 cursor-not-allowed'
                      : 'bg-[#F5F5F5] hover:bg-gray-200'
                  }`}
                >
                  <span className={selectedEmployeeName ? "text-gray-800" : "text-gray-500"}>
                    {isLoadingEmployees ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading employees...
                      </div>
                    ) : employeeError ? (
                      <div className="flex items-center gap-2 text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        Error loading data
                      </div>
                    ) : (
                      selectedEmployeeName || "Select User"
                    )}
                  </span>
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </button>
                
                {showEmployeeDropdown && !isLoadingEmployees && !employeeError && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto mt-1">
                    {employees.length > 0 ? (
                      employees.map((employee) => (
                        <button
                          key={employee.id}
                          onClick={() => handleEmployeeSelect(employee)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0 transition-colors"
                        >
                          <div className="font-medium">{employee.fullname}</div>
                          <div className="text-sm text-gray-500">@{employee.username}</div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-center">
                        No employees found
                      </div>
                    )}
                  </div>
                )}

                {employeeError && (
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-red-500 text-xs flex-1">
                      {employeeError.includes('Session expired') 
                        ? 'Authentication required. Please login again.' 
                        : 'Failed to load employee data. Please try again.'
                      }
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refetchEmployees}
                      className="text-xs h-7 px-2"
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Fingerprint 1 Cards - Always visible but disabled until employee selected */}
            <div className="grid grid-cols-2 gap-6">
              {/* Scan Fingerprint 1 */}
              <div className={`bg-white rounded-lg border p-6 flex flex-col items-center transition-opacity ${
                !selectedEmployeeId ? 'opacity-50' : ''
              }`}>
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
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
                </div>
                <h3 className="text-lg font-medium mb-3 text-center">Scan Fingerprint 1</h3>
                <p className="text-gray-600 text-center mb-6 text-sm">
                  Place your finger on the scanner to start registration.
                </p>
                
                <Button 
                  onClick={() => selectedEmployeeId && handleStartScanning('finger1-scan')}
                  disabled={!selectedEmployeeId}
                  className={`w-full transition-all duration-200 ${
                    selectedEmployeeId
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Start Scanning
                </Button>
              </div>
              
              {/* Rescan Fingerprint 1 */}
              <div className={`bg-white rounded-lg border p-6 flex flex-col items-center transition-opacity ${
                !selectedEmployeeId ? 'opacity-50' : ''
              }`}>
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
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
                </div>
                <h3 className="text-lg font-medium mb-3 text-center">Rescan Fingerprint 1</h3>
                <p className="text-gray-600 text-center mb-6 text-sm">
                  Please scan your finger again to confirm your identity.
                </p>
                
                <Button 
                  onClick={() => finger1ScanCompleted && handleStartScanning('finger1-rescan')}
                  disabled={!finger1ScanCompleted}
                  className={`w-full transition-all duration-200 ${
                    finger1RescanCompleted
                      ? 'bg-green-500 hover:bg-green-600 cursor-default'
                      : finger1ScanCompleted
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {finger1RescanCompleted ? 'Success Added' : 'Start Scanning'}
                </Button>
              </div>
            </div>
          </div>
        );

      case 'finger1-scan':
      case 'finger1-rescan':
        return (
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Fingerprint 1 Setup</h3>
              <p className="text-gray-600">Employee: <strong>{selectedEmployeeName}</strong></p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Scan Fingerprint 1 */}
              <div className="bg-white rounded-lg border p-6 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  {finger1ScanCompleted ? (
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
                <h3 className="text-lg font-medium mb-3 text-center">Scan Fingerprint 1</h3>
                <p className="text-gray-600 text-center mb-6 text-sm">
                  Place your finger on the scanner to start registration.
                </p>
                
                <Button 
                  onClick={() => handleStartScanning('finger1-scan')}
                  disabled={finger1ScanCompleted || currentStep !== 'finger1-scan'}
                  className={`w-full transition-all duration-200 ${
                    finger1ScanCompleted
                      ? 'bg-green-500 hover:bg-green-600 cursor-default'
                      : currentStep === 'finger1-scan'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {finger1ScanCompleted ? 'Success Added' : 'Start Scanning'}
                </Button>
              </div>
              
              {/* Rescan Fingerprint 1 */}
              <div className="bg-white rounded-lg border p-6 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  {finger1RescanCompleted ? (
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
                <h3 className="text-lg font-medium mb-3 text-center">Rescan Fingerprint 1</h3>
                <p className="text-gray-600 text-center mb-6 text-sm">
                  Please scan your finger again to confirm your identity.
                </p>
                
                <Button 
                  onClick={() => handleStartScanning('finger1-rescan')}
                  disabled={finger1RescanCompleted || currentStep !== 'finger1-rescan'}
                  className={`w-full transition-all duration-200 ${
                    finger1RescanCompleted
                      ? 'bg-green-500 hover:bg-green-600 cursor-default'
                      : currentStep === 'finger1-rescan'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {finger1RescanCompleted ? 'Success Added' : 'Start Scanning'}
                </Button>
              </div>
            </div>
          </div>
        );

      case 'finger1-complete':
        return (
          <div className="p-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fingerprint 1 Complete!</h3>
              <p className="text-gray-600">Ready to setup Fingerprint 2 for <strong>{selectedEmployeeName}</strong></p>
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
              <p className="text-gray-600">Employee: <strong>{selectedEmployeeName}</strong></p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Scan Fingerprint 2 */}
              <div className="bg-white rounded-lg border p-6 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  {finger2ScanCompleted ? (
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
                <h3 className="text-lg font-medium mb-3 text-center">Scan Fingerprint 2</h3>
                <p className="text-gray-600 text-center mb-6 text-sm">
                  Place your second finger on the scanner.
                </p>
                
                <Button 
                  onClick={() => handleStartScanning('finger2-scan')}
                  disabled={finger2ScanCompleted || currentStep !== 'finger2-scan'}
                  className={`w-full transition-all duration-200 ${
                    finger2ScanCompleted
                      ? 'bg-green-500 hover:bg-green-600 cursor-default'
                      : currentStep === 'finger2-scan'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {finger2ScanCompleted ? 'Success Added' : 'Start Scanning'}
                </Button>
              </div>
              
              {/* Rescan Fingerprint 2 */}
              <div className="bg-white rounded-lg border p-6 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  {finger2RescanCompleted ? (
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
                <h3 className="text-lg font-medium mb-3 text-center">Rescan Fingerprint 2</h3>
                <p className="text-gray-600 text-center mb-6 text-sm">
                  Please scan your second finger again to confirm.
                </p>
                
                <Button 
                  onClick={() => handleStartScanning('finger2-rescan')}
                  disabled={finger2RescanCompleted || currentStep !== 'finger2-rescan'}
                  className={`w-full transition-all duration-200 ${
                    finger2RescanCompleted
                      ? 'bg-green-500 hover:bg-green-600 cursor-default'
                      : currentStep === 'finger2-rescan'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {finger2RescanCompleted ? 'Success Added' : 'Start Scanning'}
                </Button>
              </div>
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
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" onClick={handleCloseDialog}></div>

        {/* Dialog */}
        <div className="bg-white rounded-lg w-full max-w-2xl relative z-10">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-[#202325]">
              Fingerprint Setup
            </h2>
            <button onClick={handleCloseDialog}>
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Step Content */}
          {renderStepContent()}

          {/* Action Buttons - Only show for employee selection step */}
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

      {/* Scanning Dialog */}
      <FingerprintScanningDialog
        isOpen={isScanningDialogOpen}
        onClose={() => setIsScanningDialogOpen(false)}
        onComplete={handleScanComplete}
        scanningType={scanningType}
      />
    </>
  );
};

export default FingerprintSetupDialog;