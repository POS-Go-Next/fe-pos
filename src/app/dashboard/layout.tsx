import { Header } from "@/components/header";
import React from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* <Header userName="Rangga Agus" userRole="Kasir" /> */}
      <main>{children}</main>
    </div>
  );
}
