"use client";

import { FC, useState } from "react";
import { DollarSign, Clock, RefreshCw, Settings } from "lucide-react";
import ActionCard from "./ActionCard";
import TimeDisplay from "./TimeDisplay";
import Image from "next/image";
import EmployeeLoginDialog from "../login/EmployeeLoginDialog";
import CloseCashierDialog from "./CloseCashierDialog";
import ReCloseCashierDialog from "./ReCloseCashierDialog";
import KassaSetupDialog from "./KassaSetupDialog";
import FingerprintSetupDialog from "./FingerprintSetupDialog";

const Dashboard: FC = () => {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isCloseCashierDialogOpen, setIsCloseCashierDialogOpen] = useState(false);
  const [isReCloseCashierDialogOpen, setIsReCloseCashierDialogOpen] = useState(false);
  const [isKassaSetupDialogOpen, setIsKassaSetupDialogOpen] = useState(false);
  const [isFingerprintDialogOpen, setIsFingerprintDialogOpen] = useState(false);

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

  const handleRegister = () => {
    setIsFingerprintDialogOpen(true);
  };

  const handleCloseFingerprintDialog = () => {
    setIsFingerprintDialogOpen(false);
  };

  const handleRegisterFingerprint = () => {
    console.log("Fingerprint registered");
    setIsFingerprintDialogOpen(false);
  };

  const handleConfigure = () => {
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
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-6xl bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-2xl">
            
            {/* Header Card */}
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

            {/* Row 2: Sales Transaction + Parameter Settings & Fingerprint */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              
              {/* Column 1 - Sales Transaction (Full Height) */}
              <div className="h-full">
                <ActionCard
                  variant="default"
                  icon={<DollarSign className="h-6 w-6" />}
                  iconBgColor="bg-green-100"
                  iconColor="text-green-600"
                  title="Sales Transaction"
                  description="Add items, apply promo, and complete payments seamlessly."
                  buttonText="Start Selling"
                  onClick={handleStartSelling}
                />
              </div>

              {/* Column 2 - Parameter Settings & Fingerprint (Stacked in 2 rows) */}
              <div className="grid grid-rows-2 gap-4">
                
                {/* Parameter Settings (Top) */}
                <ActionCard
                  variant="secondary"
                  icon={<Settings className="h-6 w-6" />}
                  iconBgColor="bg-blue-100"
                  iconColor="text-blue-600"
                  title="Parameter Settings"
                  description="Manage shifts, doctor fees, outlet settings, and receipt layout all in one place."
                  buttonText="Configure"
                  onClick={handleConfigure}
                />

                {/* Fingerprint Setup (Bottom) */}
                <ActionCard
                  variant="primary"
                  icon={<FingerprintIcon />}
                  iconBgColor="bg-white"
                  iconColor="text-blue-600"
                  title="Fingerprint Setup"
                  description="Register your fingerprint to unlock, approval and access the POS system."
                  buttonText="Register"
                  onClick={handleRegister}
                />
              </div>
            </div>

            {/* Row 3: Three Equal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Kassa Setup */}
              <ActionCard
                variant="default"
                icon={<ListIcon />}
                iconBgColor="bg-purple-100"
                iconColor="text-purple-600"
                title="Kassa Setup"
                description="Set terminal details like MAC address, queue, and POS type."
                buttonText="Configure"
                onClick={handleConfigure}
              />

              {/* Close Cashier */}
              <ActionCard
                variant="default"
                icon={<Clock className="h-6 w-6" />}
                iconBgColor="bg-orange-100"
                iconColor="text-orange-600"
                title="Close Cashier"
                description="End cashier session and generate a summary report."
                buttonText="End Shift"
                onClick={handleEndShift}
              />

              {/* Re-Close Cashier */}
              <ActionCard
                variant="default"
                icon={<RefreshCw className="h-6 w-6" />}
                iconBgColor="bg-red-100"
                iconColor="text-red-600"
                title="Re-Close Cashier"
                description="Retry closing the cashier session for regenerate a summary report."
                buttonText="Retry Close"
                onClick={handleRetryClose}
              />
            </div>
          </div>
        </div>
      </div>

      {/* All Dialog Components */}
      <EmployeeLoginDialog
        isOpen={isLoginDialogOpen}
        onClose={handleCloseDialog}
        onLogin={handleLogin}
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
      
      <FingerprintSetupDialog
        isOpen={isFingerprintDialogOpen}
        onClose={handleCloseFingerprintDialog}
        onRegister={handleRegisterFingerprint}
      />
    </>
  );
};

export default Dashboard;