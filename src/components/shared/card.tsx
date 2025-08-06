// components/shared/card.tsx
"use client";

import React from "react";
import { useRealTimeClock } from "@/lib/useRealTimeClock";

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = "",
    ...props
}) => {
    return (
        <div
            className={`bg-white rounded-2xl p-7 border border-gray-200 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

interface HeaderCardProps {
    title: string;
    subtitle: string;
    useRealTime?: boolean;
    time?: string;
    date?: string;
}

export const HeaderCard: React.FC<HeaderCardProps> = ({
    title,
    subtitle,
    useRealTime = false,
    time: staticTime,
    date: staticDate,
}) => {
    const { time: realTime, date: realDate, isClient } = useRealTimeClock();

    const displayTime =
        useRealTime && isClient ? realTime : staticTime || "07:00:00";
    const displayDate =
        useRealTime && isClient ? realDate : staticDate || "August 17, 2025";

    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">
                        {title}
                    </h1>
                    <p className="text-gray-500 flex items-center gap-1">
                        {subtitle}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                        {displayTime}
                    </div>
                    <div className="text-sm text-gray-500">{displayDate}</div>
                </div>
            </div>
        </Card>
    );
};

interface IconCardProps {
    icon: React.ReactNode;
    iconBgColor?: string;
    iconColor?: string;
    title: string;
    description: string;
    buttonText: string;
    buttonColor?: string;
    onButtonClick?: () => void;
    className?: string;
}

export const IconCard: React.FC<IconCardProps> = ({
    icon,
    iconBgColor = "bg-gray-100",
    iconColor = "text-gray-600",
    title,
    description,
    buttonText,
    buttonColor = "bg-blue-600 hover:bg-blue-700",
    onButtonClick,
    className = "",
}) => {
    return (
        <Card className={className}>
            <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mb-4 ${iconBgColor}`}
            >
                <div className={`w-6 h-6 ${iconColor}`}>{icon}</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
            </h3>
            <p className="text-gray-500 text-sm mb-6">{description}</p>
            <button
                className={`w-full text-white font-medium py-3 px-4 rounded-xl transition-colors ${buttonColor}`}
                onClick={onButtonClick}
            >
                {buttonText}
            </button>
        </Card>
    );
};

interface FeatureCardProps {
    icon: React.ReactNode;
    iconBgColor?: string;
    iconColor?: string;
    title: string;
    description: string;
    buttonText: string;
    buttonColor?: string;
    buttonTextColor?: string;
    onButtonClick?: () => void;
    className?: string;
    cardBgColor?: string;
    buttonWidth?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
    icon,
    iconBgColor = "bg-gray-100",
    iconColor = "text-gray-600",
    title,
    description,
    buttonText,
    buttonColor = "bg-blue-600 hover:bg-blue-700",
    buttonTextColor = "text-white",
    onButtonClick,
    className = "",
    cardBgColor = "bg-white",
    buttonWidth = "w-30",
}) => {
    const isBlueCard = cardBgColor.includes("bg-blue");

    return (
        <div
            className={`${cardBgColor} rounded-2xl p-7 ${
                isBlueCard ? "" : "border border-gray-200"
            } flex items-center justify-between gap-3 ${className}`}
        >
            <div className="flex items-center gap-4">
                <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor}`}
                >
                    <div className={`w-6 h-6 ${iconColor}`}>{icon}</div>
                </div>
                <div>
                    <h3
                        className={`text-lg font-semibold mb-1 ${
                            isBlueCard ? "text-white" : "text-gray-900"
                        }`}
                    >
                        {title}
                    </h3>
                    <p
                        className={`text-sm ${
                            isBlueCard ? "text-white/80" : "text-gray-500"
                        }`}
                    >
                        {description}
                    </p>
                </div>
            </div>
            <button
                className={`${buttonTextColor} font-medium py-2 px-6 rounded-xl transition-colors ${buttonColor} ${buttonWidth}`}
                onClick={onButtonClick}
            >
                {buttonText}
            </button>
        </div>
    );
};
