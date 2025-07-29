// components/ui/date-range-picker.tsx - FIXED VERSION
"use client";

import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedRange, setSelectedRange] = React.useState<
    DateRange | undefined
  >(value);

  React.useEffect(() => {
    setSelectedRange(value);
  }, [value]);

  const formatDate = (date: Date): string => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const getDisplayText = (): string => {
    if (!selectedRange?.from && !selectedRange?.to) {
      return placeholder;
    }
    if (selectedRange.from && selectedRange.to) {
      return `${formatDate(selectedRange.from)} - ${formatDate(
        selectedRange.to
      )}`;
    }
    if (selectedRange.from) {
      return `From ${formatDate(selectedRange.from)}`;
    }
    if (selectedRange.to) {
      return `Until ${formatDate(selectedRange.to)}`;
    }
    return placeholder;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(firstDay);
      prevMonthDay.setDate(firstDay.getDate() - (startingDayOfWeek - i));
      days.push(prevMonthDay);
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // Add empty cells for days after the last day to complete the grid
    const remainingCells = 42 - days.length; // 6 rows × 7 days = 42 cells
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(lastDay);
      nextMonthDay.setDate(lastDay.getDate() + i);
      days.push(nextMonthDay);
    }

    return days;
  };

  const isDateInCurrentMonth = (date: Date): boolean => {
    return (
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()
    );
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedRange) return false;
    const dateTime = date.getTime();
    const fromTime = selectedRange.from?.getTime();
    const toTime = selectedRange.to?.getTime();

    return (
      Boolean(fromTime && dateTime === fromTime) ||
      Boolean(toTime && dateTime === toTime)
    );
  };

  const isDateInRange = (date: Date): boolean => {
    if (!selectedRange?.from || !selectedRange?.to) return false;
    const dateTime = date.getTime();
    return (
      dateTime > selectedRange.from.getTime() &&
      dateTime < selectedRange.to.getTime()
    );
  };

  const handleDateClick = (date: Date) => {
    if (!selectedRange?.from || (selectedRange.from && selectedRange.to)) {
      // Start new selection
      const newRange = { from: date, to: undefined };
      setSelectedRange(newRange);
    } else if (selectedRange.from && !selectedRange.to) {
      // Complete the range
      if (date.getTime() < selectedRange.from.getTime()) {
        // If selected date is before the start date, make it the new start
        const newRange = { from: date, to: selectedRange.from };
        setSelectedRange(newRange);
        // 🔥 REMOVED: Don't call onChange here - wait for Apply button
      } else {
        // Normal case: selected date is after start date
        const newRange = { from: selectedRange.from, to: date };
        setSelectedRange(newRange);
        // 🔥 REMOVED: Don't call onChange here - wait for Apply button
      }
    }
  };

  const handleReset = () => {
    setSelectedRange(undefined);
    onChange?.(undefined);
    setIsOpen(false); // 🔥 FIXED: Close popup after reset
  };

  const handleApply = () => {
    // 🔥 FIXED: Only call onChange when Apply button is clicked
    onChange?.(selectedRange);
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentDate);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal bg-[#F5F5F5] border-none h-12 min-w-[200px]",
            !selectedRange?.from &&
              !selectedRange?.to &&
              "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {getDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white text-gray-900" align="end">
        <div className="p-4">
          {/* Header with month/year navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("prev")}
                className="text-gray-900 hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <span className="text-gray-900 min-w-[60px] text-center">
                  {months[currentDate.getMonth()]}
                </span>
                <span className="text-gray-900 min-w-[60px] text-center">
                  {currentDate.getFullYear()}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("next")}
                className="text-gray-900 hover:bg-gray-100"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Week day headers */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="h-8 w-8 flex items-center justify-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {daysInMonth.map((date, index) => {
              const isCurrentMonth = isDateInCurrentMonth(date);
              const isSelected = isDateSelected(date);
              const isInRange = isDateInRange(date);

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    "h-8 w-8 flex items-center justify-center text-sm rounded transition-colors",
                    !isCurrentMonth && "text-gray-400 opacity-50",
                    isCurrentMonth &&
                      !isSelected &&
                      !isInRange &&
                      "text-gray-900 hover:bg-gray-100",
                    isInRange && !isSelected && "bg-blue-100 text-blue-900",
                    isSelected &&
                      "bg-blue-600 text-white font-medium hover:bg-blue-700"
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer buttons */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
