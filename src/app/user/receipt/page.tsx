"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
// import { useRealTimeClock } from "@/hooks/useRealTimeClock";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRealTimeClock } from "@/lib/useRealTimeClock";

interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

export default function UserReceiptPage() {
  const router = useRouter();
  const { time, date, isClient } = useRealTimeClock();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const receiptItems: ReceiptItem[] = [
    {
      name: "1357 PREMIUM CC BROWN HAIR 30ML",
      qty: 8,
      price: 5000,
      total: 40000,
    },
    {
      name: "33 GREEN PROPOLIS 10G",
      qty: 2,
      price: 7750,
      total: 15500,
    },
    {
      name: "3M STERI-DUAL ECG",
      qty: 1,
      price: 7000,
      total: 7000,
    },
  ];

  const totalAmount = receiptItems.reduce((sum, item) => sum + item.total, 0);

  const handleSuccess = () => {
    router.push("/user/success");
  };

  const handleBack = () => {
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
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-2 min-h-[600px]">
            {/* Left side - Video/Image placeholder */}
            <div className="bg-gray-200 flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <p>Video/Advertisement Area</p>
              </div>
            </div>

            {/* Right side - Receipt content */}
            <div className="p-8 flex flex-col">
              {/* Receipt Header */}
              <div className="bg-blue-900 text-white text-center py-2 rounded-t-lg mb-4">
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

              {/* Receipt Table */}
              <div className="flex-1">
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">
                          Nama Barang
                        </th>
                        <th className="text-center p-3 text-sm font-medium text-gray-700">
                          Qty
                        </th>
                        <th className="text-right p-3 text-sm font-medium text-gray-700">
                          Harga
                        </th>
                        <th className="text-right p-3 text-sm font-medium text-gray-700">
                          Sub Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {receiptItems.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 text-sm text-gray-800">
                            {item.name}
                          </td>
                          <td className="p-3 text-sm text-center text-gray-800">
                            {item.qty}
                          </td>
                          <td className="p-3 text-sm text-right text-gray-800">
                            {item.price.toLocaleString()}
                          </td>
                          <td className="p-3 text-sm text-right text-gray-800">
                            {item.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="mt-4">
                  <div className="bg-teal-500 text-white p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">TOTAL</span>
                      <span className="text-xl font-bold">
                        Rp {totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 py-3"
                >
                  Kembali
                </Button>
                <Button
                  onClick={handleSuccess}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3"
                >
                  Konfirmasi
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
