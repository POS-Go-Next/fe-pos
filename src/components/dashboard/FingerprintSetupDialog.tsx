// components/dashboard/FingerprintSetupDialog.tsx - ENHANCED WITH CONSISTENT TOKEN FLOW
"use client";

import { FC, useState, useEffect } from "react";
import { X, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmployeeLoginDialog from "../shared/EmployeeLoginDialog";
import FingerprintScanningDialog from "../shared/FingerprintScanningDialog";
import { useUser } from "@/hooks/useUser";
import { UserData, FingerprintSetupData, FingerprintOption } from "@/types/user";
import { showSuccessAlert, showErrorAlert } from "@/lib/swal";
import Swal from 'sweetalert2';

interface FingerprintSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
}

// Hardcoded fingerprint options
const fingerprintOptions: FingerprintOption[] = [
  { id: 1, name: 'Finger 1' },
  { id: 2, name: 'Finger 2' }
];

const FingerprintSetupDialog: FC<FingerprintSetupDialogProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  // Authentication states - ENHANCED PATTERN
  const [hasValidToken, setHasValidToken] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Use custom hook for user data
  const { userList: employees, isLoading: isLoadingEmployees, error: employeeError, refetch: refetchEmployees } = useUser({
    limit: 50,
    offset: 0
  });

  // Fingerprint setup states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>("");
  const [selectedFingerprintId, setSelectedFingerprintId] = useState<1 | 2 | null>(null);
  const [selectedFingerprintName, setSelectedFingerprintName] = useState<string>("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [showFingerprintDropdown, setShowFingerprintDropdown] = useState(false);
  
  // Scanning states
  const [isScanningDialogOpen, setIsScanningDialogOpen] = useState(false);
  const [scanningType, setScanningType] = useState<'scan' | 'rescan' | ''>('');
  const [firstScanCompleted, setFirstScanCompleted] = useState(false);
  const [rescanCompleted, setRescanCompleted] = useState(false);

  // ENHANCED: Check authentication when dialog opens
  useEffect(() => {
    if (isOpen) {
      checkAuthenticationStatus();
    }
  }, [isOpen]);

  // ENHANCED: API-based authentication check with better debugging
  const checkAuthenticationStatus = async () => {
    console.log('🔍 FINGERPRINT SETUP - CHECKING AUTHENTICATION STATUS...');
    setIsCheckingAuth(true);
    
    // Debug: Check all cookies
    console.log('🍪 All document.cookie:', document.cookie);
    console.log('🍪 Cookie length:', document.cookie.length);
    
    try {
      // Test authentication with API call - with explicit credentials
      const response = await fetch('/api/user?limit=1&offset=0', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // IMPORTANT: Include cookies in request
      });

      console.log('🔍 Fingerprint Auth API Test Response status:', response.status);
      console.log('🔍 Response headers:', Object.fromEntries(Array.from(response.headers.entries())));
      
      if (response.ok) {
        // API call successful = user is authenticated
        const data = await response.json();
        console.log('✅ FINGERPRINT API CALL SUCCESS: User is authenticated', data);
        setHasValidToken(true);
        setIsCheckingAuth(false);
        
        // Fetch employees data after successful auth
        setTimeout(() => {
          refetchEmployees();
        }, 500);
      } else if (response.status === 401) {
        // 401 = Not authenticated
        console.log('❌ FINGERPRINT API CALL 401: Not authenticated');
        const errorData = await response.text();
        console.log('❌ Error response:', errorData);
        setHasValidToken(false);
        setIsCheckingAuth(false);
        showSessionExpiredPopup();
      } else {
        // Other error - assume need login for safety
        console.log('⚠️ FINGERPRINT API CALL ERROR:', response.status);
        setHasValidToken(false);
        setIsCheckingAuth(false);
        showSessionExpiredPopup();
      }
    } catch (error) {
      console.log('❌ FINGERPRINT API CALL FAILED:', error);
      // Network error - assume need login
      setHasValidToken(false);
      setIsCheckingAuth(false);
      showSessionExpiredPopup();
    }
  };

  // ENHANCED: Session expired popup that flows to login
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
      console.log('🔄 Fingerprint session expired popup result:', result);
      
      // Both timer end and button click should open login dialog
      if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
        console.log('➡️ Opening login dialog for fingerprint setup');
        setIsLoginDialogOpen(true);
      }
    });
  };

  // ENHANCED: Handle successful login - refresh data
  const handleLoginSuccess = (userData: any) => {
    console.log('✅ Fingerprint Setup - Login successful:', userData);
    setHasValidToken(true);
    setIsLoginDialogOpen(false);
    
    // Refresh all data after login
    setTimeout(() => {
      refetchEmployees();
    }, 1000);
  };

  // ENHANCED: Handle login dialog close
  const handleLoginClose = () => {
    console.log('❌ Fingerprint Setup - Login dialog closed without login');
    setIsLoginDialogOpen(false);
    // Close parent dialog if login is cancelled
    onClose();
  };

  // Handle employee selection
  const handleEmployeeSelect = (employee: UserData) => {
    setSelectedEmployeeId(employee.id);
    setSelectedEmployeeName(employee.fullname);
    setShowEmployeeDropdown(false);
    
    // Reset fingerprint selection and scan states when employee changes
    setSelectedFingerprintId(null);
    setSelectedFingerprintName("");
    setFirstScanCompleted(false);
    setRescanCompleted(false);
  };

  // Handle fingerprint selection
  const handleFingerprintSelect = (fingerprint: FingerprintOption) => {
    setSelectedFingerprintId(fingerprint.id);
    setSelectedFingerprintName(fingerprint.name);
    setShowFingerprintDropdown(false);
    
    // Reset scan states when fingerprint changes
    setFirstScanCompleted(false);
    setRescanCompleted(false);
  };

  // Handle start scanning
  const handleStartScanning = (type: 'scan' | 'rescan') => {
    setScanningType(type);
    setIsScanningDialogOpen(true);
  };

  // Handle scan completion
  const handleScanComplete = () => {
    if (scanningType === 'scan') {
      setFirstScanCompleted(true);
    } else if (scanningType === 'rescan') {
      setRescanCompleted(true);
    }
    setIsScanningDialogOpen(false);
    setScanningType('');
  };

  // ENHANCED: Handle save with token validation
  const handleSave = async () => {
    if (!selectedEmployeeId || !selectedFingerprintId) {
      await showErrorAlert(
        'Validation Error',
        'Please select employee and fingerprint before saving.',
        'OK'
      );
      return;
    }

    if (!firstScanCompleted || !rescanCompleted) {
      await showErrorAlert(
        'Incomplete Setup',
        'Please complete both fingerprint scans before saving.',
        'OK'
      );
      return;
    }

    try {
      console.log('🚀 Fingerprint Setup - Starting save process...');

      // Double check token before submission
      if (!hasValidToken) {
        console.log('🔄 Token invalid during submission, showing session expired popup');
        showSessionExpiredPopup();
        return;
      }

      // Prepare fingerprint data for API
      const fingerprintData: FingerprintSetupData = {
        user_id: selectedEmployeeId,
        mac_address: "80:30:49:62:79:89", // Hardcoded as requested
        number_of_fingerprint: selectedFingerprintId
      };
      
      console.log('📤 Saving fingerprint data:', fingerprintData);
      
      // Call API to save fingerprint setup
      const response = await fetch('/api/fingerprint/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials
        body: JSON.stringify(fingerprintData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        // Handle session expired during submission
        if (response.status === 401) {
          console.log('🔄 Fingerprint Setup - Session expired during submission');
          setHasValidToken(false);
          showSessionExpiredPopup();
          return;
        }
        
        throw new Error(result.message || 'Failed to save fingerprint data');
      }

      console.log('✅ Fingerprint setup successful:', result);
      
      // Show success message
      await showSuccessAlert(
        'Success!',
        'Fingerprint setup completed successfully',
        1500
      );
      
      // Reset states and close dialog
      handleReset();
      onRegister(); // Call parent callback
      onClose();
    } catch (error) {
      console.error('❌ Error saving fingerprint:', error);
      
      // Handle network errors
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

  // Handle reset
  const handleReset = () => {
    setSelectedEmployeeId(null);
    setSelectedEmployeeName("");
    setSelectedFingerprintId(null);
    setSelectedFingerprintName("");
    setFirstScanCompleted(false);
    setRescanCompleted(false);
  };

  // ENHANCED: Handle close dialog
  const handleCloseDialog = () => {
    handleReset();
    setHasValidToken(false); // Reset auth state
    setIsCheckingAuth(true); // Reset checking state
    onClose();
  };

  if (!isOpen) return null;

  // ENHANCED: Show loading while checking authentication
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

  // ENHANCED: Show login dialog if no valid token
  if (!hasValidToken) {
    return (
      <EmployeeLoginDialog
        isOpen={isLoginDialogOpen}
        onClose={handleLoginClose}
        onLogin={handleLoginSuccess}
      />
    );
  }

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

          <div className="p-6">
            {/* Employee and Fingerprint Selection */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Employee Name Dropdown */}
              <div>
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
                      {employeeError.includes('Session expired') && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setHasValidToken(false);
                            showSessionExpiredPopup();
                          }}
                          className="text-xs h-7 px-2 bg-blue-600 hover:bg-blue-700"
                        >
                          Login
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Fingerprint Dropdown */}
              <div>
                <label className="block text-gray-800 mb-2 font-medium">
                  Fingerprint
                </label>
                <div className="relative">
                  <button
                    onClick={() => selectedEmployeeId && setShowFingerprintDropdown(!showFingerprintDropdown)}
                    disabled={!selectedEmployeeId}
                    className={`w-full flex justify-between items-center text-left rounded-md py-4 px-4 transition-colors ${
                      selectedEmployeeId 
                        ? 'bg-[#F5F5F5] hover:bg-gray-200' 
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span className={selectedFingerprintName ? "text-gray-800" : "text-gray-500"}>
                      {selectedFingerprintName || "Select Finger"}
                    </span>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </button>
                  
                  {showFingerprintDropdown && selectedEmployeeId && (
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 mt-1">
                      {fingerprintOptions.map((fingerprint) => (
                        <button
                          key={fingerprint.id}
                          onClick={() => handleFingerprintSelect(fingerprint)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0 transition-colors"
                        >
                          {fingerprint.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fingerprint Registration Areas */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Scan Fingerprint */}
              <div className="bg-white rounded-lg border p-6 flex flex-col items-center">
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
                <h3 className="text-lg font-medium mb-3 text-center">Scan Fingerprint</h3>
                <p className="text-gray-600 text-center mb-6 text-sm">
                  Place your finger on the scanner to start registration.
                </p>
                
                <Button 
                  onClick={() => handleStartScanning('scan')}
                  disabled={!selectedEmployeeId || !selectedFingerprintId}
                  className={`w-full transition-all duration-200 ${
                    firstScanCompleted
                      ? 'bg-green-500 hover:bg-green-600'
                      : selectedEmployeeId && selectedFingerprintId
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {firstScanCompleted ? 'Success Added' : 'Start Scanning'}
                </Button>
              </div>
              
              {/* Rescan Fingerprint */}
              <div className="bg-white rounded-lg border p-6 flex flex-col items-center">
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
                <h3 className="text-lg font-medium mb-3 text-center">Rescan Fingerprint</h3>
                <p className="text-gray-600 text-center mb-6 text-sm">
                  Please scan your finger again to confirm your identity.
                </p>
                
                <Button 
                  onClick={() => handleStartScanning('rescan')}
                  disabled={!firstScanCompleted}
                  className={`w-full transition-all duration-200 ${
                    rescanCompleted
                      ? 'bg-green-500 hover:bg-green-600'
                      : firstScanCompleted
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {rescanCompleted ? 'Success Added' : 'Start Scanning'}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={handleReset}
                className="px-8 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={!firstScanCompleted || !rescanCompleted}
                className={`px-8 transition-all duration-200 ${
                  firstScanCompleted && rescanCompleted
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Save
              </Button>
            </div>
          </div>
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