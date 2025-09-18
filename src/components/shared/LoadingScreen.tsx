"use client";

import { FC } from "react";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen: FC<LoadingScreenProps> = ({ message = "Loading..." }) => (
    <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="bg-white rounded-lg p-8 relative z-10">
            <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span>{message}</span>
            </div>
        </div>
    </div>
);

export default LoadingScreen;
