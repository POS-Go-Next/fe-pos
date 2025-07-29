// components/shared/FingerprintCard.tsx
"use client";

import { FC } from "react";
import { CheckCircle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FingerprintCardProps {
  title: string;
  description: string;
  isCompleted: boolean;
  isEnabled: boolean;
  onAction: () => void;
  onEdit?: () => void;
  actionText?: string;
}

const FingerprintCard: FC<FingerprintCardProps> = ({
  title,
  description,
  isCompleted,
  isEnabled,
  onAction,
  onEdit,
  actionText = "Start Scanning",
}) => (
  <div
    className={`bg-white rounded-lg border p-6 flex flex-col items-center transition-opacity ${
      !isEnabled ? "opacity-50" : ""
    }`}
  >
    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
      {isCompleted ? (
        <CheckCircle className="h-8 w-8 text-green-600" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-blue-600"
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
      )}
    </div>
    <h3 className="text-lg font-medium mb-3 text-center">{title}</h3>
    <p className="text-gray-600 text-center mb-6 text-sm">{description}</p>

    <div className="w-full flex items-center gap-2">
      <Button
        onClick={onAction}
        disabled={!isEnabled}
        className={`flex-1 transition-all duration-200 ${
          isCompleted
            ? "bg-green-500 hover:bg-green-600 cursor-default"
            : isEnabled
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isCompleted ? "Success Added" : actionText}
      </Button>

      {isCompleted && onEdit && (
        <Button
          onClick={onEdit}
          variant="outline"
          size="sm"
          className="px-3 border-gray-300 hover:border-blue-500 hover:text-blue-600"
          title="Edit fingerprint"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
    </div>
  </div>
);

export default FingerprintCard;
