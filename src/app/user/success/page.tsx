"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRealTimeClock } from "@/lib/useRealTimeClock";
import { Activity, Droplets, Heart, Leaf, Pill, Shield } from "lucide-react";

interface ProductCard {
  id: number;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  bgColor: string;
}

export default function UserSuccessPage() {
  const router = useRouter();
  const { time, date, isClient } = useRealTimeClock();
  const [mounted, setMounted] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const bannerImages = [
    "/images/banner-1.png",
    "/images/banner-1.png",
    "/images/banner-1.png",
  ];

  useEffect(() => {
    if (!mounted || !isClient) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) =>
        prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [mounted, isClient, bannerImages.length]);

  const formatPrice = (price: number): string => {
    if (typeof window === "undefined") {
      return price.toString();
    }
    return price.toLocaleString("id-ID");
  };

  const products: ProductCard[] = [
    {
      id: 1,
      name: "Hydromamma",
      description: "Brain Mist",
      price: 50000,
      icon: <Droplets className="w-6 h-6 text-blue-600" />,
      bgColor: "bg-gray-800",
    },
    {
      id: 2,
      name: "Somethinc",
      description: "10% Lactic + Bakuchiol Serum",
      price: 111400,
      icon: <Activity className="w-6 h-6 text-teal-600" />,
      bgColor: "bg-teal-50",
    },
    {
      id: 3,
      name: "Hydromamma",
      description: "Brain Mist",
      price: 50000,
      icon: <Droplets className="w-6 h-6 text-blue-600" />,
      bgColor: "bg-gray-800",
    },
    {
      id: 4,
      name: "Somethinc",
      description: "10% Lactic + Bakuchiol Serum",
      price: 111400,
      icon: <Activity className="w-6 h-6 text-teal-600" />,
      bgColor: "bg-teal-50",
    },
    {
      id: 5,
      name: "Medy CLB",
      description: "Health Supplement",
      price: 69800,
      icon: <Pill className="w-6 h-6 text-purple-600" />,
      bgColor: "bg-gray-800",
    },
    {
      id: 6,
      name: "NNO",
      description: "Collagen Supplement",
      price: 131900,
      icon: <Heart className="w-6 h-6 text-yellow-600" />,
      bgColor: "bg-yellow-100",
    },
    {
      id: 7,
      name: "Nu Enot",
      description: "Vitamin",
      price: 251800,
      icon: <Shield className="w-6 h-6 text-green-600" />,
      bgColor: "bg-green-100",
    },
    {
      id: 8,
      name: "Curcuma Plus",
      description: "Emulsion Jeruk 60ml",
      price: 45000,
      icon: <Leaf className="w-6 h-6 text-orange-600" />,
      bgColor: "bg-orange-100",
    },
    {
      id: 9,
      name: "Noroid",
      description: "Cream 15ml",
      price: 28500,
      icon: <Activity className="w-6 h-6 text-blue-600" />,
      bgColor: "bg-blue-100",
    },
    {
      id: 10,
      name: "Bihophor",
      description: "Sulfate Powder Therapy 40ml",
      price: 85000,
      icon: <Droplets className="w-6 h-6 text-red-600" />,
      bgColor: "bg-red-100",
    },
    {
      id: 11,
      name: "Nutrimax",
      description: "Formula 30 Tablet",
      price: 125000,
      icon: <Pill className="w-6 h-6 text-green-600" />,
      bgColor: "bg-green-200",
    },
    {
      id: 12,
      name: "Fitkom",
      description: "Strawberry Anggur Jeruk 60 Gummy",
      price: 89500,
      icon: <Heart className="w-6 h-6 text-pink-600" />,
      bgColor: "bg-pink-100",
    },
  ];

  if (!mounted || !isClient) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex p-12 gap-8 items-stretch">
        <div
          className="w-[60%] bg-gray-200 rounded-xl flex items-center justify-center"
          style={{ height: "500px" }}
        ></div>

        <div
          className="w-[40%] bg-white rounded-xl overflow-hidden flex flex-col"
          style={{ height: "500px" }}
        >
          <div className="bg-blue-900 text-white py-4 flex-shrink-0">
            <div className="flex items-center justify-center">
              <Image
                src="/images/header-logo.svg"
                alt="Apotek Roxy"
                width={200}
                height={40}
                className="h-8 w-auto"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center px-20 py-6">
            <div className="mb-6">
              <Image
                src="/icons/user-success.svg"
                alt="Success"
                width={120}
                height={120}
                className="w-32 h-32"
              />
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Success!
              </h1>
              <p className="text-gray-600 text-base leading-relaxed">
                Transaksi berhasil! Terima kasih atas kepercayaan Kamu. Telah
                memilih Apotek Roxy.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="bg-gradient-to-r from-blue-900 to-purple-900 p-8 relative mb-8"
        style={{ height: "280px" }}
      >
        <div className="absolute inset-0 bg-gray-500 opacity-80 z-10"></div>

        <div
          className="space-y-4 relative overflow-hidden"
          style={{ height: "100%" }}
        >
          <div
            className="flex space-x-4 animate-scroll-right"
            style={{
              width: `${products.length * 240}px`,
            }}
          >
            {[...products, ...products].map((product, index) => (
              <div
                key={`row1-${product.id}-${index}`}
                className="bg-white rounded-lg p-4 flex-shrink-0"
                style={{ width: "220px" }}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-10 h-10 ${product.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    {product.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold inline-block">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="flex space-x-4 animate-scroll-left"
            style={{
              width: `${products.length * 240}px`,
            }}
          >
            {[...products, ...products].map((product, index) => (
              <div
                key={`row2-${product.id}-${index}`}
                className="bg-white rounded-lg p-4 flex-shrink-0"
                style={{ width: "220px" }}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-10 h-10 ${product.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    {product.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold inline-block">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-[70%]">
          <div
            className="relative overflow-hidden rounded-xl shadow-2xl"
            style={{ height: "312px" }}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{
                transform: `translateX(-${currentBannerIndex * 100}%)`,
              }}
            >
              {bannerImages.map((banner, index) => (
                <div key={index} className="w-full flex-shrink-0 h-full">
                  <Image
                    src={banner}
                    alt={`Banner ${index + 1}`}
                    width={1200}
                    height={312}
                    className="w-full h-full object-cover rounded-xl"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentBannerIndex ? "bg-white" : "bg-white/50"
                  }`}
                  onClick={() => setCurrentBannerIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${products.length * 240}px);
          }
        }

        @keyframes scroll-left {
          0% {
            transform: translateX(-${products.length * 240}px);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-scroll-right {
          animation: scroll-right 30s linear infinite;
        }

        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }

        .animate-scroll-right:hover,
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
