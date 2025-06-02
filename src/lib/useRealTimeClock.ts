// lib/useRealTimeClock.ts
'use client';

import { useState, useEffect } from 'react';

interface RealTimeClockData {
  time: string;
  date: string;
  fullDate: Date;
  isClient: boolean; // Add flag to track if we're on client
}

export const useRealTimeClock = (): RealTimeClockData => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark that we're now on the client
    setIsClient(true);
    
    // Update immediately when client loads
    setCurrentTime(new Date());

    // Set up interval to update every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);

  // Format time as HH:MM:SS (24-hour format)
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Format date as "Month DD, YYYY"
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return {
    time: formatTime(currentTime),
    date: formatDate(currentTime),
    fullDate: currentTime,
    isClient
  };
};

// Alternative hook with custom format options
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
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };

  const defaultDateFormat: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', timeFormat || defaultTimeFormat);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', dateFormat || defaultDateFormat);
  };

  return {
    time: formatTime(currentTime),
    date: formatDate(currentTime),
    fullDate: currentTime,
    isClient
  };
};