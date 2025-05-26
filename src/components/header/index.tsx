"use client";

import { useState } from "react";
import { Search, Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  userName: string;
  userRole: string;
  avatarSrc?: string;
}

export function Header({ userName, userRole, avatarSrc }: HeaderProps) {
  const [notificationCount] = useState(2);

  return (
    <header className="h-[76px] w-full flex items-center justify-between px-12 bg-white shadow-sm">
      {/* Left Side - Logo & Text */}
      <div className="flex items-center space-x-3">
        <Image
          src="/icons/store-icon.svg"
          alt="Apotek Logo"
          width={30}
          height={30}
        />
        <div className="flex flex-col">
          <h1 className="text-base font-bold text-[#202325]">Apotek Roxy</h1>
          <p className="text-[14px] font-medium text-[#808080]">
            Outlet Jatibaru
          </p>
        </div>
      </div>

      {/* Middle - Search */}
      <div className="flex-1 max-w-[355px] px-4">
        <div className="relative w-full">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-black h-4 w-4" />
          <input
            type="text"
            placeholder="Search here"
            className="w-full rounded-xl pl-12 pr-4 py-3 border bg-[#F5F5F5] border-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Right Side - Notifications & Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none">
              <Bell className="h-5 w-5 text-gray-600" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
                  {notificationCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 bg-white">
            <div className="p-3">
              <h3 className="font-medium">Notifications</h3>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-3 focus:bg-gray-100">
              <div className="flex flex-col">
                <span className="font-medium">Stock alert</span>
                <span className="text-sm text-gray-500">
                  Paracetamol is running low
                </span>
                <span className="text-xs text-gray-400 mt-1">2 hours ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3 focus:bg-gray-100">
              <div className="flex flex-col">
                <span className="font-medium">New order</span>
                <span className="text-sm text-gray-500">
                  Order #12345 has been placed
                </span>
                <span className="text-xs text-gray-400 mt-1">3 hours ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-2 flex justify-center text-blue-600 hover:text-blue-800 focus:bg-gray-100">
              <Link href="/notifications">View all notifications</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-2 focus:outline-none">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={userName}
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-500 font-medium">
                    {userName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-col text-left hidden md:flex">
                <span className="text-sm font-medium text-gray-900">
                  {userName}
                </span>
                <span className="text-xs text-gray-500">{userRole}</span>
              </div>
              <svg
                className="w-4 h-4 text-gray-500 hidden md:block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white">
            <div className="p-3 border-b">
              <p className="font-medium">{userName}</p>
              <p className="text-sm text-gray-500">{userRole}</p>
            </div>
            <DropdownMenuItem className="p-2 cursor-pointer">
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="p-2 cursor-pointer">
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-2 text-red-600 cursor-pointer">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
