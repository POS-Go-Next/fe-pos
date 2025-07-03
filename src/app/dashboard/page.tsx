// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { DollarSign, Clock, RefreshCw, Settings } from "lucide-react";
import ActionCard from "./_components/ActionCard";
import TimeDisplay from "./_components/TimeDisplay";
import Image from "next/image";
import CloseCashierDialog from "./_components/CloseCashierDialog";
import ReCloseCashierDialog from "./_components/ReCloseCashierDialog";
import KassaSetupDialog from "./_components/KassaSetupDialog";
import FingerprintSetupDialog from "./_components/FingerprintSetupDialog";
import ParameterSettingsDialog from "./_components/ParameterSettingsDialog";
import EmployeeLoginDialog from "@/components/shared/EmployeeLoginDialog";

export default function DashboardPage() {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isCloseCashierDialogOpen, setIsCloseCashierDialogOpen] = useState(false);
  const [isReCloseCashierDialogOpen, setIsReCloseCashierDialogOpen] = useState(false);
  const [isKassaSetupDialogOpen, setIsKassaSetupDialogOpen] = useState(false);
  const [isFingerprintDialogOpen, setIsFingerprintDialogOpen] = useState(false);
  const [isParameterDialogOpen, setIsParameterDialogOpen] = useState(false);

  const handleStartSelling = () => {
    setIsLoginDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsLoginDialogOpen(false);
  };

  const handleLogin = (userData: any) => {
    console.log("Login successful with user data:", userData);
    setIsLoginDialogOpen(false);
    // You can store user data in context or state management here
    // For now, redirect to the next page
    window.location.href = "/create-order/choose-menu";
  };

  // Enhanced fingerprint setup handler
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

  // Custom Fingerprint Icon
  const FingerprintIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
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
  );

  // Custom List Icon for Kassa Setup
  const ListIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  );

  return (
    <>
      {/* Main Container with Background Image */}
      <div 
        className="min-h-screen p-8"
        style={{
          backgroundImage: "url('/images/background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Content Container with Glass Effect - Centered */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="w-[960px] rounded-[56px] border-2 border-white backdrop-blur-[80px] bg-white/25 p-8 shadow-2xl">
            
            {/* Header Card - Baris 1 (Full Width) */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 mb-2">
                    Simplify Transactions with an Integrated POS System
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
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

            {/* Main Grid - 3x3 Layout */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              
              {/* Baris 2: Sales Transaction (1 kolom) */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg h-full flex flex-col">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0 mb-4">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Transaction</h3>
                <p className="text-sm text-gray-600 mb-6 flex-grow">Add items, apply promo, and complete payments seamlessly.</p>
                <button 
                  className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-colors hover:bg-blue-700"
                  onClick={handleStartSelling}
                >
                  Start Selling
                </button>
              </div>

              {/* Baris 2: Parameter Settings & Fingerprint (2 kolom) */}
              <div className="col-span-2 grid grid-rows-2 gap-4">
                
                {/* Parameter Settings (Top) - Horizontal Layout */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <Settings className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Parameter Settings</h3>
                        <p className="text-sm text-gray-600">Manage shifts, doctor fees, outlet settings, and receipt layout all in one place.</p>
                      </div>
                    </div>
                    <button 
                      className="bg-blue-600 text-white font-medium py-2 px-6 rounded-xl transition-colors hover:bg-blue-700 whitespace-nowrap ml-4"
                      onClick={handleParameterConfigure}
                    >
                      Configure
                    </button>
                  </div>
                </div>

                {/* Fingerprint Setup (Bottom) - Blue Background */}
                <div className="bg-blue-600 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0">
                        <FingerprintIcon />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Fingerprint Setup</h3>
                        <p className="text-sm text-white/80">Register your fingerprint to unlock, approval and access the POS system.</p>
                      </div>
                    </div>
                    <button 
                      className="bg-white text-blue-600 font-medium py-2 px-6 rounded-xl transition-colors hover:bg-gray-50 whitespace-nowrap ml-4"
                      onClick={handleFingerprintRegister}
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Baris 3: Three Equal Cards */}
            <div className="grid grid-cols-3 gap-4">
              
              {/* Kassa Setup */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg h-full flex flex-col">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0 mb-4">
                  <ListIcon />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Kassa Setup</h3>
                <p className="text-sm text-gray-600 mb-6 flex-grow">Set terminal details like MAC address, queue, and POS type.</p>
                <button 
                  className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-colors hover:bg-blue-700"
                  onClick={handleKassaConfigure}
                >
                  Configure
                </button>
              </div>

              {/* Close Cashier */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg h-full flex flex-col">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0 mb-4">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Close Cashier</h3>
                <p className="text-sm text-gray-600 mb-6 flex-grow">End cashier session and generate a summary report.</p>
                <button 
                  className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-colors hover:bg-blue-700"
                  onClick={handleEndShift}
                >
                  End Shift
                </button>
              </div>

              {/* Re-Close Cashier */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg h-full flex flex-col">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0 mb-4">
                  <RefreshCw className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Re-Close Cashier</h3>
                <p className="text-sm text-gray-600 mb-6 flex-grow">Retry closing the cashier session for regenerate a summary report.</p>
                <button 
                  className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-colors hover:bg-blue-700"
                  onClick={handleRetryClose}
                >
                  Retry Close
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* All Dialog Components */}
      
      {/* Employee Login Dialog for Sales Transaction */}
      <EmployeeLoginDialog
        isOpen={isLoginDialogOpen}
        onClose={handleCloseDialog}
        onLogin={handleLogin}
      />

      {/* Enhanced Fingerprint Setup Dialog with Login Flow */}
      <FingerprintSetupDialog
        isOpen={isFingerprintDialogOpen}
        onClose={() => setIsFingerprintDialogOpen(false)}
        onRegister={handleFingerprintComplete}
      />

      {/* Parameter Settings Dialog */}
      <ParameterSettingsDialog
        isOpen={isParameterDialogOpen}
        onClose={handleParameterClose}
        onSubmit={handleParameterSubmit}
      />

      {/* Close Cashier Dialog */}
      <CloseCashierDialog
        isOpen={isCloseCashierDialogOpen}
        onClose={handleCloseShiftDialog}
        onSubmit={handleSubmitShift}
      />
      
      {/* Re-Close Cashier Dialog */}
      <ReCloseCashierDialog
        isOpen={isReCloseCashierDialogOpen}
        onClose={handleCloseReShiftDialog}
        onSubmit={handleSubmitReShift}
      />
      
      {/* Kassa Setup Dialog */}
      <KassaSetupDialog
        isOpen={isKassaSetupDialogOpen}
        onClose={handleCloseKassaDialog}
        onSubmit={handleSubmitKassa}
      />
    </>
  );
}