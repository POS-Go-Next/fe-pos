"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
// import { useRealTimeClock } from "@/hooks/useRealTimeClock";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRealTimeClock } from "@/lib/useRealTimeClock";

export default function UserSuccessPage() {
  const router = useRouter();
  const { time, date, isClient } = useRealTimeClock();
  const [countdown, setCountdown] = useState(10);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isClient) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/user/welcome");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, mounted, isClient]);

  const handleBackToWelcome = () => {
    router.push("/user/welcome");
  };

  if (!mounted || !isClient) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-blue-500">
          <div className="grid grid-cols-2 min-h-[600px]">
            {/* Left side - Video/Image placeholder */}
            <div className="bg-gray-200 flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <p>Video/Advertisement Area</p>
              </div>
            </div>

            {/* Right side - Success content */}
            <div className="p-8 flex flex-col justify-center items-center">
              {/* Receipt Header */}
              <div className="bg-blue-900 text-white text-center py-2 rounded-lg mb-8 w-full">
                <div className="flex items-center justify-center space-x-2">
                  <Image
                    src="/icons/logo-roxy.svg"
                    alt="Apotek Roxy"
                    width={24}
                    height={24}
                    className="bg-white rounded p-1"
                  />
                  <div className="text-xs">BNI</div>
                </div>
              </div>

              {/* Success Icon and Message */}
              <div className="text-center mb-8">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-4 relative">
                    <div className="text-lg font-bold text-black">$</div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute top-2 left-2 w-4 h-6 bg-orange-400 rounded-sm"></div>
                    <div className="absolute top-6 left-2 w-4 h-2 bg-orange-400 rounded-sm"></div>
                    <div className="absolute top-10 left-2 w-4 h-2 bg-orange-400 rounded-sm"></div>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Success!
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed max-w-sm">
                  Transaksi berhasil! Terima kasih atas kepercayaan Kamu. Telah
                  memilih Apotek Roxy.
                </p>
              </div>

              {/* Countdown and Button */}
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-4">
                  Kembali ke halaman utama dalam {countdown} detik
                </p>
                <Button
                  onClick={handleBackToWelcome}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
                >
                  Kembali ke Beranda
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom advertisement banner */}
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                  <Image
                    src="/icons/logo-roxy.svg"
                    alt="Apotek Roxy"
                    width={48}
                    height={48}
                  />
                </div>
                <div className="flex space-x-2">
                  <div className="w-12 h-12 bg-orange-500 rounded"></div>
                  <div className="w-12 h-12 bg-blue-500 rounded"></div>
                </div>
              </div>

              <div className="text-center flex-1 mx-8">
                <h3 className="text-3xl font-bold mb-2">Daily Deals</h3>
                <p className="text-2xl text-yellow-400 font-bold">
                  Cashback s.d. 30%
                </p>
                <p className="text-sm">Pakai Kartu Debit & Kredit</p>
                <p className="text-xs">Periode program hingga 31 Maret 2024</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-white font-bold">BNI</div>
                <div className="text-white font-bold">mandiri</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
