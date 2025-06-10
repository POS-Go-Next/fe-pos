// components/dashboard/FingerprintSetupDialog.tsx - COMPLETE WITH API INTEGRATION
"use client";

import { FC, useState, useEffect } from "react";
import { X, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmployeeLoginDialog from "../shared/EmployeeLoginDialog";
import FingerprintScanningDialog from "../shared/FingerprintScanningDialog";
import { useUser } from "@/hooks/useUser";
import { UserData, FingerprintSetupData, FingerprintOption } from "@/types/user";
import { showSuccessAlert, showErrorAlert } from "@/lib/swal";

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
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

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

  // Check login status when dialog opens
  useEffect(() => {
    if (isOpen && !isLoggedIn) {
      setIsLoginDialogOpen(true);
    }
  }, [isOpen, isLoggedIn]);

  // Handle successful login
  const handleLoginSuccess = (userData: any) => {
    setIsLoggedIn(true);
    setIsLoginDialogOpen(false);
    console.log("Login successful:", userData);
    // Refetch employees data after login
    refetchEmployees();
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

  // Handle save
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
      // Prepare fingerprint data for API
      const fingerprintData: FingerprintSetupData = {
        user_id: selectedEmployeeId,
        mac_address: "80:30:49:62:79:89", // Hardcoded as requested
        number_of_fingerprint: selectedFingerprintId
      };
      
      console.log('Saving fingerprint data:', fingerprintData);
      
      // Call API to save fingerprint setup
      const response = await fetch('/api/fingerprint/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fingerprintData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save fingerprint data');
      }

      console.log('Fingerprint setup successful:', result);
      
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
      console.error('Error saving fingerprint:', error);
      
      // Show error message with SweetAlert
      await showErrorAlert(
        'Setup Failed',
        error instanceof Error ? error.message : 'Failed to save fingerprint data. Please try again.',
        'OK'
      );
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

  // Handle close dialog
  const handleCloseDialog = () => {
    handleReset();
    setIsLoggedIn(false); // Reset login state
    onClose();
  };

  // Don't render main dialog if not logged in
  if (!isOpen || (!isLoggedIn && isLoginDialogOpen)) {
    return (
      <>
        {/* Login Dialog */}
        <EmployeeLoginDialog
          isOpen={isLoginDialogOpen}
          onClose={() => {
            setIsLoginDialogOpen(false);
            onClose(); // Close parent dialog if login is cancelled
          }}
          onLogin={handleLoginSuccess}
        />
      </>
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
                      <p className="text-red-500 text-xs flex-1">{employeeError}</p>
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