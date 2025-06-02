// src/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import { HeaderCard, IconCard, FeatureCard } from '@/components/shared/card';
import { 
  DollarIcon, 
  SettingsIcon, 
  FingerprintIcon, 
  CreditCardIcon, 
  ClockIcon, 
  RefreshIcon 
} from '@/components/shared/icons';
import EmployeeLoginDialog from '@/components/shared/EmployeeLoginDialog';
import { 
  CloseCashierDialog, 
  ReCloseCashierDialog, 
  KassaSetupDialog, 
  FingerprintSetupDialog 
} from '@/components/dashboard';
import ParameterSettingsDialog from '@/components/dashboard/ParameterSettingsDialog';

const POSDashboard = () => {
  // State untuk semua dialog
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showParameterDialog, setShowParameterDialog] = useState(false);
  const [showKassaSetupDialog, setShowKassaSetupDialog] = useState(false);
  const [showCloseCashierDialog, setShowCloseCashierDialog] = useState(false);
  const [showReCloseCashierDialog, setShowReCloseCashierDialog] = useState(false);
  const [showFingerprintDialog, setShowFingerprintDialog] = useState(false);

  // Handler untuk Start Selling
  const handleStartSelling = () => {
    setShowLoginDialog(true);
  };

  // Handler untuk Login Success
  const handleLoginSuccess = (userData: any) => {
    console.log('User logged in:', userData);
    setShowLoginDialog(false);
    // Redirect ke choose-menu page
    window.location.href = '/create-order/choose-menu';
  };

  // Handler untuk Parameter Settings
  const handleParameterSettings = () => {
    setShowParameterDialog(true);
  };

  // Handler untuk Fingerprint Setup
  const handleFingerprintSetup = () => {
    setShowFingerprintDialog(true);
  };

  // Handler untuk Kassa Setup
  const handleKassaSetup = () => {
    setShowKassaSetupDialog(true);
  };

  // Handler untuk Close Cashier
  const handleCloseCashier = () => {
    setShowCloseCashierDialog(true);
  };

  // Handler untuk Re-Close Cashier
  const handleReCloseCashier = () => {
    setShowReCloseCashierDialog(true);
  };

  // Handler untuk Kassa Setup Submit
  const handleKassaSetupSubmit = () => {
    console.log('Kassa Setup submitted');
    setShowKassaSetupDialog(false);
  };

  // Handler untuk Close Cashier Submit
  const handleCloseCashierSubmit = () => {
    console.log('Close Cashier submitted');
    setShowCloseCashierDialog(false);
  };

  // Handler untuk Re-Close Cashier Submit
  const handleReCloseCashierSubmit = () => {
    console.log('Re-Close Cashier submitted');
    setShowReCloseCashierDialog(false);
  };

  // Handler untuk Parameter Settings Submit
  const handleParameterSettingsSubmit = (data: any) => {
    console.log('Parameter Settings saved:', data);
    setShowParameterDialog(false);
  };

  // Handler untuk Fingerprint Register
  const handleFingerprintRegister = () => {
    console.log('Fingerprint registered');
    setShowFingerprintDialog(false);
  };

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center bg-no-repeat" 
      style={{
        backgroundImage: "url('/images/background.png')", 
        backgroundColor: "cornflowerblue"
      }}
    >
      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div 
          className="w-[960px] h-[796px] rounded-[56px] border-2 border-white backdrop-blur-[80px] relative"
          style={{
            background: 'radial-gradient(circle, #A5C1FF 0%, #6E9FF4 22.4%, #4688D4 100%)'
          }}
        >
          {/* POS System Content */}
          <div className="w-full h-full p-10 flex flex-col gap-6">
            
            {/* Baris 1: Full Width Header Card */}
            <HeaderCard
              title="Simplify Transactions with an Integrated POS System"
              subtitle="Fast, Accurate, and Reliable Checkout Experience 😊"
              useRealTime={true}
            />

            {/* Baris 2: Sales Transaction + Parameter Settings & Fingerprint Setup */}
            <div className="flex gap-6 flex-1">
              {/* Kolom 1: Sales Transaction */}
              <IconCard
                icon={<DollarIcon className="w-6 h-6" />}
                iconBgColor="bg-green-100"
                iconColor="text-green-600"
                title="Sales Transaction"
                description="Add items, apply promo, and complete payments seamlessly."
                buttonText="Start Selling"
                buttonColor="bg-blue-600 hover:bg-blue-700"
                className="w-80"
                onButtonClick={handleStartSelling}
              />

              {/* Kolom 2 & 3: Parameter Settings & Fingerprint Setup (2 baris) */}
              <div className="flex-1 flex flex-col gap-6">
                {/* Parameter Settings */}
                <FeatureCard
                  icon={<SettingsIcon className="w-6 h-6" />}
                  iconBgColor="bg-blue-100"
                  iconColor="text-blue-600"
                  title="Parameter Settings"
                  description="Manage shifts, doctor fees, outlet settings, and receipt layout all in one place."
                  buttonText="Configure"
                  buttonColor="bg-blue-600 hover:bg-blue-700"
                  buttonTextColor="text-white"
                  buttonWidth="w-30"
                  onButtonClick={handleParameterSettings}
                />

                {/* Fingerprint Setup */}
                <FeatureCard
                  icon={<FingerprintIcon className="w-6 h-6" />}
                  iconBgColor="bg-white/20"
                  iconColor="text-white"
                  title="Fingerprint Setup"
                  description="Register your fingerprint to unlock, approval and access the POS system."
                  buttonText="Register"
                  buttonColor="bg-white hover:bg-gray-50"
                  buttonTextColor="text-blue-600"
                  cardBgColor="bg-blue-600"
                  buttonWidth="w-30"
                  onButtonClick={handleFingerprintSetup}
                />
              </div>
            </div>

            {/* Baris 3: Kassa Setup, Close Cashier, Re-Close Cashier */}
            <div className="flex gap-6">
              <IconCard
                icon={<CreditCardIcon className="w-6 h-6" />}
                iconBgColor="bg-purple-100"
                iconColor="text-purple-600"
                title="Kassa Setup"
                description="Set terminal details like MAC address, queue, and POS type."
                buttonText="Configure"
                buttonColor="bg-blue-600 hover:bg-blue-700"
                className="flex-1"
                onButtonClick={handleKassaSetup}
              />

              <IconCard
                icon={<ClockIcon className="w-6 h-6" />}
                iconBgColor="bg-orange-100"
                iconColor="text-orange-600"
                title="Close Cashier"
                description="End cashier session and generate a summary report."
                buttonText="End Shift"
                buttonColor="bg-blue-600 hover:bg-blue-700"
                className="flex-1"
                onButtonClick={handleCloseCashier}
              />

              <IconCard
                icon={<RefreshIcon className="w-6 h-6" />}
                iconBgColor="bg-red-100"
                iconColor="text-red-600"
                title="Re-Close Cashier"
                description="Retry closing the cashier session for regenerate a summary report."
                buttonText="Retry Close"
                buttonColor="bg-blue-600 hover:bg-blue-700"
                className="flex-1"
                onButtonClick={handleReCloseCashier}
              />
            </div>

          </div>
        </div>
      </div>

      {/* All Dialog Components */}
      
      {/* Employee Login Dialog */}
      <EmployeeLoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onLogin={handleLoginSuccess}
      />

      {/* Parameter Settings Dialog */}
      <ParameterSettingsDialog
        isOpen={showParameterDialog}
        onClose={() => setShowParameterDialog(false)}
        onSubmit={handleParameterSettingsSubmit}
      />

      {/* Kassa Setup Dialog */}
      <KassaSetupDialog
        isOpen={showKassaSetupDialog}
        onClose={() => setShowKassaSetupDialog(false)}
        onSubmit={handleKassaSetupSubmit}
      />

      {/* Close Cashier Dialog */}
      <CloseCashierDialog
        isOpen={showCloseCashierDialog}
        onClose={() => setShowCloseCashierDialog(false)}
        onSubmit={handleCloseCashierSubmit}
      />

      {/* Re-Close Cashier Dialog */}
      <ReCloseCashierDialog
        isOpen={showReCloseCashierDialog}
        onClose={() => setShowReCloseCashierDialog(false)}
        onSubmit={handleReCloseCashierSubmit}
      />

      {/* Fingerprint Setup Dialog */}
      <FingerprintSetupDialog
        isOpen={showFingerprintDialog}
        onClose={() => setShowFingerprintDialog(false)}
        onRegister={handleFingerprintRegister}
      />
    </div>
  );
};

export default POSDashboard;