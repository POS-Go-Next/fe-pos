"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  iconSize?: number;
  background?: string;
}

export default function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  className = "",
  iconSize = 18,
  background = "bg-white",
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        className={`pl-10 ${background}`}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
      <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        size={iconSize}
      />
    </div>
  );
}
