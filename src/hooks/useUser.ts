"use client";

import { useState, useEffect } from "react";

interface UserData {
    id: number;
    fullname: string;
    username: string;
    email: string;
    phone: string;
    role_id: number;
    position_id?: number;
    fingerprint1: string;
    fingerprint2: string;
}

interface UserApiResponse {
    message: string;
    data: {
        docs: UserData[];
        totalDocs: number;
        page: number;
        totalPages: number;
    };
}

interface UseUserReturn {
    userList: UserData[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
    totalPages?: number;
    totalDocs?: number;
}

interface UseUserParams {
    limit?: number;
    offset?: number;
    search?: string;
}

export const useUser = (params: UseUserParams = {}): UseUserReturn => {
    const { limit = 50, offset = 0, search = "" } = params;

    const [userList, setUserList] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState<number>();
    const [totalDocs, setTotalDocs] = useState<number>();

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const queryParams = new URLSearchParams({
                offset: offset.toString(),
                limit: limit.toString(),
            });

            if (search) {
                queryParams.append("search", search);
            }

            const response = await fetch(
                `/api/user?${queryParams.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                // Handle authentication errors specifically
                if (response.status === 401) {
                    throw new Error("Session expired. Please login again.");
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: UserApiResponse = await response.json();

            if (data.data?.docs) {
                setUserList(data.data.docs);
                setTotalPages(data.data.totalPages);
                setTotalDocs(data.data.totalDocs);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(
                err instanceof Error ? err.message : "Failed to fetch user data"
            );
            setUserList([]);
            setTotalPages(undefined);
            setTotalDocs(undefined);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [limit, offset, search]);

    const refetch = () => {
        fetchUsers();
    };

    return {
        userList,
        isLoading,
        error,
        refetch,
        totalPages,
        totalDocs,
    };
};
