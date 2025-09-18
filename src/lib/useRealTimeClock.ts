"use client";

import { useState, useEffect } from "react";

interface RealTimeClockData {
    time: string;
    date: string;
    fullDate: Date;
    isClient: boolean;
}

export const useRealTimeClock = (): RealTimeClockData => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        setCurrentTime(new Date());

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return {
        time: formatTime(currentTime),
        date: formatDate(currentTime),
        fullDate: currentTime,
        isClient,
    };
};

export const useRealTimeClockCustom = (
    timeFormat?: Intl.DateTimeFormatOptions,
    dateFormat?: Intl.DateTimeFormatOptions
): RealTimeClockData => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setCurrentTime(new Date());

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const defaultTimeFormat: Intl.DateTimeFormatOptions = {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };

    const defaultDateFormat: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString(
            "en-US",
            timeFormat || defaultTimeFormat
        );
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString(
            "en-US",
            dateFormat || defaultDateFormat
        );
    };

    return {
        time: formatTime(currentTime),
        date: formatDate(currentTime),
        fullDate: currentTime,
        isClient,
    };
};
