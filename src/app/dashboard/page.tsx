// app/dashboard/page.tsx - UPDATED WITH BIOMETRIC INTEGRATION
"use client";

import EmployeeLoginDialog from "@/components/shared/EmployeeLoginDialog";
import Image from "next/image";
import { useState } from "react";
import CloseCashierDialog from "./_components/CloseCashierDialog";
import FingerprintSetupDialog from "./_components/FingerprintSetupDialog";
import KassaSetupDialog from "./_components/KassaSetupDialog";
import ParameterSettingsDialog from "./_components/ParameterSettingsDialog";
import ReCloseCashierDialog from "./_components/ReCloseCashierDialog";
import TimeDisplay from "./_components/TimeDisplay";

export default function DashboardPage() {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isCloseCashierDialogOpen, setIsCloseCashierDialogOpen] = useState(false);
  const [isReCloseCashierDialogOpen, setIsReCloseCashierDialogOpen] = useState(false);
  const [isKassaSetupDialogOpen, setIsKassaSetupDialogOpen] = useState(false);
  const [isFingerprintDialogOpen, setIsFingerprintDialogOpen] = useState(false);
  const [isParameterDialogOpen, setIsParameterDialogOpen] = useState(false);

  // ✅ Check if user has valid token
  const checkAuthToken = (): boolean => {
    if (typeof window === "undefined") return false;

    try {
      // Check localStorage for auth token and user data
      const authToken = localStorage.getItem("auth-token");
      const userData = localStorage.getItem("user-data");

      console.log("🔍 Checking auth token:", {
        hasAuthToken: !!authToken,
        hasUserData: !!userData,
        authTokenLength: authToken?.length || 0,
        userDataExists: !!userData,
      });

      return !!(authToken && userData);
    } catch (error) {
      console.error("Error checking auth token:", error);
      return false;
    }
  };

  // ✅ UPDATED: Modified handleStartSelling to check token first
  const handleStartSelling = () => {
    console.log("🚀 Start Selling clicked");

    // Check if user already has valid token
    const hasValidToken = checkAuthToken();

    if (hasValidToken) {
      console.log("✅ User already authenticated, redirecting to create-order");
      // User is already authenticated, redirect directly
      window.location.href = "/create-order/choose-menu";
    } else {
      console.log("❌ No valid token found, showing login dialog");
      // No valid token, show login dialog (which now includes biometric option)
      setIsLoginDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsLoginDialogOpen(false);
  };

  // Handle both regular and biometric login success
  const handleLogin = (userData: any) => {
    console.log("Login successful with user data:", userData);
    
    // Save user data to localStorage (for both regular and biometric login)
    try {
      localStorage.setItem("user-data", JSON.stringify(userData));
      localStorage.setItem("auth-token", "biometric-token-" + Date.now()); // Simulate token for biometric
    } catch (error) {
      console.error("Error saving user data:", error);
    }

    setIsLoginDialogOpen(false);
    window.location.href = "/create-order/choose-menu";
  };

  const handleFingerprintRegister = () => {
    setIsFingerprintDialogOpen(true);
  };

  const handleFingerprintComplete = () => {
    console.log("Fingerprint setup completed successfully");
    setIsFingerprintDialogOpen(false);
  };

  const handleParameterConfigure = () => {
    setIsParameterDialogOpen(true);
  };

  const handleParameterClose = () => {
    setIsParameterDialogOpen(false);
  };

  const handleParameterSubmit = (data: any) => {
    console.log("Parameter settings saved:", data);
    setIsParameterDialogOpen(false);
  };

  const handleKassaConfigure = () => {
    setIsKassaSetupDialogOpen(true);
  };

  const handleCloseKassaDialog = () => {
    setIsKassaSetupDialogOpen(false);
  };

  const handleSubmitKassa = () => {
    console.log("Kassa configuration submitted");
    setIsKassaSetupDialogOpen(false);
  };

  const handleEndShift = () => {
    setIsCloseCashierDialogOpen(true);
  };

  const handleCloseShiftDialog = () => {
    setIsCloseCashierDialogOpen(false);
  };

  const handleSubmitShift = () => {
    console.log("Shift submitted");
    setIsCloseCashierDialogOpen(false);
  };

  const handleRetryClose = () => {
    setIsReCloseCashierDialogOpen(true);
  };

  const handleCloseReShiftDialog = () => {
    setIsReCloseCashierDialogOpen(false);
  };

  const handleSubmitReShift = () => {
    console.log("Re-shift submitted");
    setIsReCloseCashierDialogOpen(false);
  };

  return (
    <>
      <div
        className="min-h-screen p-8 bg-[#547df9]"
        style={{
          backgroundImage: "url('/images/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="w-[960px] rounded-[56px] border-2 border-white backdrop-blur-[80px] bg-white/25 p-12 shadow-2xl">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="font-semibold text-black mb-2">
                    Simplify Transactions with an Integrated POS System
                  </h1>
                  <p className="text-[#8C8C8C] flex items-center gap-2 text-sm">
                    Fast, Accurate, and Reliable Checkout Experience
                    <Image
                      src="/icons/smile.svg"
                      width={20}
                      height={20}
                      alt="smile"
                    />
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <TimeDisplay />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg h-full flex flex-col">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0 mb-4">
                  <Image
                    src={"/icons/money.svg"}
                    width={24}
                    height={24}
                    alt="icon"
                    priority
                  />
                </div>
                <h3 className="font-semibold text-black mb-2">
                  Sales Transaction
                </h3>
                <p className="text-sm text-[#8C8C8C] mb-6 flex-grow">
                  Add items, apply promo, and complete payments seamlessly.
                </p>
                <button
                  className="w-full bg-blue-600 text-white font-medium h-11 px-4 rounded-xl transition-colors hover:bg-blue-700 text-sm"
                  onClick={handleStartSelling}
                >
                  Start Selling
                </button>
              </div>

              <div className="col-span-2 grid grid-rows-2 gap-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <Image
                          src={"/icons/setting.svg"}
                          width={24}
                          height={24}
                          alt="icon"
                          priority
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-black mb-1">
                          Parameter Settings
                        </h3>
                        <p className="text-sm text-[#8C8C8C]">
                          Manage shifts, doctor fees, outlet settings, and
                          receipt layout all in one place.
                        </p>
                      </div>
                    </div>
                    <button
                      className="bg-blue-600 text-white font-medium h-11 px-6 rounded-xl transition-colors hover:bg-blue-700 whitespace-nowrap ml-4 text-sm"
                      onClick={handleParameterConfigure}
                    >
                      Configure
                    </button>
                  </div>
                </div>

                <div className="bg-blue-600 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0">
                        <Image
                          src={"/icons/finger.svg"}
                          width={24}
                          height={24}
                          alt="icon"
                          priority
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          Fingerprint Setup
                        </h3>
                        <p className="text-sm text-white">
                          Register your fingerprint to unlock, approval and
                          access the POS system.
                        </p>
                      </div>
                    </div>
                    <button
                      className="bg-white text-blue-600 font-medium h-11 px-7 rounded-xl transition-colors hover:bg-gray-50 whitespace-nowrap ml-4 text-sm"
                      onClick={handleFingerprintRegister}
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg h-full flex flex-col">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0 mb-4">
                  <Image
                    src={"/icons/kassa.svg"}
                    width={24}
                    height={24}
                    alt="icon"
                    priority
                  />
                </div>
                <h3 className="font-semibold text-black mb-2">Kassa Setup</h3>
                <p className="text-sm text-[#8C8C8C] mb-6 flex-grow">
                  Set terminal details like MAC address, queue, and POS type.
                </p>
                <button
                  className="w-full bg-blue-600 text-white font-medium h-11 px-4 rounded-xl transition-colors hover:bg-blue-700"
                  onClick={handleKassaConfigure}
                >
                  Configure
                </button>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg h-full flex flex-col">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0 mb-4">
                  <Image
                    src={"/icons/close.svg"}
                    width={24}
                    height={24}
                    alt="icon"
                    priority
                  />
                </div>
                <h3 className="font-semibold text-black mb-2">Close Cashier</h3>
                <p className="text-sm text-[#8C8C8C] mb-6 flex-grow">
                  End cashier session and generate a summary report.
                </p>
                <button
                  className="w-full bg-blue-600 text-white font-medium h-11 px-4 rounded-xl transition-colors hover:bg-blue-700"
                  onClick={handleEndShift}
                >
                  End Shift
                </button>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg h-full flex flex-col">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0 mb-4">
                  <Image
                    src={"/icons/reclose.svg"}
                    width={24}
                    height={24}
                    alt="icon"
                    priority
                  />
                </div>
                <h3 className="font-semibold text-black mb-2">
                  Re-Close Cashier
                </h3>
                <p className="text-sm text-[#8C8C8C] mb-6 flex-grow">
                  Retry closing the cashier session for regenerate a summary
                  report.
                </p>
                <button
                  className="w-full bg-blue-600 text-white font-medium h-11 px-4 rounded-xl transition-colors hover:bg-blue-700"
                  onClick={handleRetryClose}
                >
                  Retry Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Employee Login Dialog now includes biometric option */}
      <EmployeeLoginDialog
        isOpen={isLoginDialogOpen}
        onClose={handleCloseDialog}
        onLogin={handleLogin}
      />

      <FingerprintSetupDialog
        isOpen={isFingerprintDialogOpen}
        onClose={() => setIsFingerprintDialogOpen(false)}
        onRegister={handleFingerprintComplete}
      />

      <ParameterSettingsDialog
        isOpen={isParameterDialogOpen}
        onClose={handleParameterClose}
        onSubmit={handleParameterSubmit}
      />

      <CloseCashierDialog
        isOpen={isCloseCashierDialogOpen}
        onClose={handleCloseShiftDialog}
        onSubmit={handleSubmitShift}
      />

      <ReCloseCashierDialog
        isOpen={isReCloseCashierDialogOpen}
        onClose={handleCloseReShiftDialog}
        onSubmit={handleSubmitReShift}
      />

      <KassaSetupDialog
        isOpen={isKassaSetupDialogOpen}
        onClose={handleCloseKassaDialog}
        onSubmit={handleSubmitKassa}
      />
    </>
  );
}