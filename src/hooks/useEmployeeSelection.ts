// hooks/useEmployeeSelection.ts - NEW FILE
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { UserData } from "@/types/user";
import { useUser } from "@/hooks/useUser";

interface EmployeeState {
  selectedEmployeeId: number | null;
  selectedEmployeeName: string;
  showDropdown: boolean;
  searchTerm: string;
}

export const useEmployeeSelection = (isAuthenticated: boolean) => {
  const [employeeState, setEmployeeState] = useState<EmployeeState>({
    selectedEmployeeId: null,
    selectedEmployeeName: "",
    showDropdown: false,
    searchTerm: "",
  });

  // 🔥 FIX: Use ref to track if we've already fetched for this auth state
  const hasAuthenticatedRef = useRef(false);
  const lastAuthStateRef = useRef(isAuthenticated);

  const {
    userList: employees,
    isLoading,
    error,
    refetch,
  } = useUser({
    limit: 50,
    offset: 0,
  });

  // 🔥 FIX: Only refetch when authentication state changes from false to true
  useEffect(() => {
    if (isAuthenticated && !hasAuthenticatedRef.current) {
      console.log(
        "🔄 Authentication confirmed for first time, refetching employees..."
      );
      hasAuthenticatedRef.current = true;
      lastAuthStateRef.current = true;

      // Add small delay to prevent immediate refetch
      const timeoutId = setTimeout(() => {
        refetch();
      }, 100);

      return () => clearTimeout(timeoutId);
    } else if (!isAuthenticated) {
      // Reset when logged out
      hasAuthenticatedRef.current = false;
      lastAuthStateRef.current = false;
    }

    lastAuthStateRef.current = isAuthenticated;
  }, [isAuthenticated, refetch]);

  const selectEmployee = useCallback((employee: UserData) => {
    setEmployeeState((prev) => ({
      ...prev,
      selectedEmployeeId: employee.id,
      selectedEmployeeName: employee.fullname,
      showDropdown: false,
      searchTerm: "",
    }));
  }, []);

  const toggleDropdown = useCallback(() => {
    if (!isLoading) {
      setEmployeeState((prev) => ({
        ...prev,
        showDropdown: !prev.showDropdown,
      }));
    }
  }, [isLoading]);

  const updateSearchTerm = useCallback((term: string) => {
    setEmployeeState((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  const resetEmployee = useCallback(() => {
    setEmployeeState({
      selectedEmployeeId: null,
      selectedEmployeeName: "",
      showDropdown: false,
      searchTerm: "",
    });
    // 🔥 FIX: Reset auth tracking when resetting employee
    hasAuthenticatedRef.current = false;
  }, []);

  // 🔥 FIX: Controlled refetch that prevents loops
  const controlledRefetch = useCallback(() => {
    if (isAuthenticated && !isLoading) {
      console.log("🔄 Manual refetch triggered");
      refetch();
    }
  }, [isAuthenticated, isLoading, refetch]);

  const filteredEmployees = employees.filter((employee) =>
    employee.fullname
      .toLowerCase()
      .includes(employeeState.searchTerm.toLowerCase())
  );

  return {
    employeeState,
    employees: filteredEmployees,
    isLoading,
    error,
    selectEmployee,
    toggleDropdown,
    updateSearchTerm,
    resetEmployee,
    refetch: controlledRefetch, // 🔥 FIX: Use controlled refetch
  };
};
