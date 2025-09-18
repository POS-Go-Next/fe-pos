"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { UserData } from "@/types/user";
import { useEmployeesInfinite } from "@/hooks/useEmployeesInfinite";

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

    const {
        filteredEmployees: employees,
        isLoading,
        isLoadingMore,
        error,
        hasMoreData,
        totalCount,
        searchTerm: currentSearchTerm,
        setSearchTerm,
        loadMore,
        refetch,
    } = useEmployeesInfinite({
        limit: 10,
        enabled: isAuthenticated,
    });

    useEffect(() => {
        if (employeeState.searchTerm !== currentSearchTerm) {
            setSearchTerm(employeeState.searchTerm);
        }
    }, [employeeState.searchTerm, currentSearchTerm, setSearchTerm]);

    const selectEmployee = useCallback((employee: UserData) => {
        console.log("Employee selected:", employee.fullname);
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
        console.log("Resetting employee selection");
        setEmployeeState({
            selectedEmployeeId: null,
            selectedEmployeeName: "",
            showDropdown: false,
            searchTerm: "",
        });
    }, []);

    const controlledRefetch = useCallback(() => {
        if (isAuthenticated && !isLoading) {
            console.log("Manual refetch triggered");
            refetch();
        }
    }, [isAuthenticated, isLoading, refetch]);

    return {
        employeeState,
        employees,
        isLoading,
        error,
        selectEmployee,
        toggleDropdown,
        updateSearchTerm,
        resetEmployee,
        refetch: controlledRefetch,
        hasMoreData,
        isLoadingMore,
        loadMore,
        totalCount,
    };
};
