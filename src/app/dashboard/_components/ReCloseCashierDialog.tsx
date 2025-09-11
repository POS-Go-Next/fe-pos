"use client";

import { FC, useState, useEffect, useRef } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useSystemInfo } from "@/hooks/useSystemInfo";
import { useCashierActivity } from "@/hooks/useCashierActivity";
import { useCashierActivitiesList } from "@/hooks/useCashierActivitiesList";
import { useRecloseActivity } from "@/hooks/useRecloseActivity";
import EmployeeLoginDialog from "@/components/shared/EmployeeLoginDialog";
import Pagination from "@/components/shared/pagination";
import Swal from "sweetalert2";

interface ReCloseCashierDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

const ReCloseCashierDialog: FC<ReCloseCashierDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [hasValidToken, setHasValidToken] = useState(false);
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
    const [isCheckingToken, setIsCheckingToken] = useState(true);
    const [cashierActivitiesData, setCashierActivitiesData] =
        useState<any>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Search and pagination states
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const pageSizeOptions = [5, 10, 25, 50, 100];

    const { logout } = useAuth();
    const {
        deviceId,
        isLoading: isSystemLoading,
        error: systemError,
        refetch: refetchSystemInfo,
    } = useSystemInfo();
    const { checkCashierActivity } = useCashierActivity();
    const { getCashierActivitiesList } = useCashierActivitiesList();
    const { recloseActivity, isLoading: isReclosing } = useRecloseActivity();

    // Filter function for search
    const filterCashierActivities = (data: any, searchTerm: string) => {
        if (!data || !data.docs) return data;
        if (!searchTerm.trim()) return data;

        const search = searchTerm.toLowerCase();

        const filteredDocs = data.docs.filter(
            (item: any) =>
                item.cashier?.fullname?.toLowerCase().includes(search) ||
                item.cashier?.username?.toLowerCase().includes(search) ||
                item.kd_kassa?.toLowerCase().includes(search) ||
                item.shift?.toString().includes(search) ||
                item.kode?.toLowerCase().includes(search)
        );

        return {
            ...data,
            docs: filteredDocs,
            totalDocs: filteredDocs.length,
            totalPages: Math.ceil(filteredDocs.length / pageSize),
        };
    };

    // Keyboard navigation
    const scrollToSelectedRow = (index: number) => {
        if (!tableContainerRef.current) return;
        const rows = tableContainerRef.current.querySelectorAll("tbody tr");
        const selectedRow = rows[index];
        if (selectedRow) {
            selectedRow.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const isTypingInSearch =
                document.activeElement === searchInputRef.current &&
                (e.key.length === 1 ||
                    e.key === "Backspace" ||
                    e.key === "Delete");

            if (isTypingInSearch) return;

            const filteredData = filterCashierActivities(
                cashierActivitiesData,
                searchTerm
            );
            const activitiesList = filteredData?.docs || [];

            switch (e.key) {
                case "PageDown":
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prevIndex) => {
                        if (prevIndex === -1 && activitiesList.length > 0) {
                            scrollToSelectedRow(0);
                            return 0;
                        }
                        const newIndex = Math.min(
                            prevIndex + 1,
                            activitiesList.length - 1
                        );
                        scrollToSelectedRow(newIndex);
                        return newIndex;
                    });
                    break;

                case "PageUp":
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prevIndex) => {
                        if (prevIndex === -1 && activitiesList.length > 0) {
                            scrollToSelectedRow(0);
                            return 0;
                        }
                        const newIndex = Math.max(prevIndex - 1, 0);
                        scrollToSelectedRow(newIndex);
                        return newIndex;
                    });
                    break;

                case "Enter":
                    e.preventDefault();
                    if (
                        selectedIndex >= 0 &&
                        selectedIndex < activitiesList.length
                    ) {
                        handleRowClick(
                            activitiesList[selectedIndex],
                            selectedIndex
                        );
                    }
                    break;

                case "Home":
                    e.preventDefault();
                    if (activitiesList.length > 0) {
                        setSelectedIndex(0);
                        scrollToSelectedRow(0);
                    }
                    break;

                case "End":
                    e.preventDefault();
                    if (activitiesList.length > 0) {
                        const lastIndex = activitiesList.length - 1;
                        setSelectedIndex(lastIndex);
                        scrollToSelectedRow(lastIndex);
                    }
                    break;

                case "Escape":
                    e.preventDefault();
                    handleLogoutAndClose();
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, cashierActivitiesData, selectedIndex, searchTerm]);

    useEffect(() => {
        const filteredData = filterCashierActivities(
            cashierActivitiesData,
            searchTerm
        );
        const activitiesList = filteredData?.docs || [];
        if (activitiesList.length > 0) {
            setSelectedIndex(0);
        } else {
            setSelectedIndex(-1);
        }
    }, [cashierActivitiesData, searchTerm]);

    useEffect(() => {
        if (isOpen) {
            checkTokenStatus();
            setCurrentPage(1);
            setPageSize(10);
            setSearchInput("");
            setSearchTerm("");
            setSelectedIndex(-1);
            setSelectedItem(null);

            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, deviceId]);

    // Search debouncing
    useEffect(() => {
        const trimmedSearch = searchInput.trim();

        if (trimmedSearch.length >= 3 || trimmedSearch.length === 0) {
            const timeoutId = setTimeout(() => {
                setSearchTerm(trimmedSearch);
                setCurrentPage(1);
            }, 300);

            return () => clearTimeout(timeoutId);
        }
    }, [searchInput]);

    const checkTokenStatus = async () => {
        console.log("🔍 CHECKING TOKEN STATUS...");
        setIsCheckingToken(true);

        try {
            const result = await getCashierActivitiesList(pageSize, 0);

            if (result.success) {
                console.log("✅ API CALL SUCCESS: User is authenticated");
                setCashierActivitiesData(result.data);
                setHasValidToken(true);
                setIsCheckingToken(false);
            } else if (result.isSessionExpired) {
                console.log("❌ API CALL 401: Not authenticated");
                setHasValidToken(false);
                setIsCheckingToken(false);
                showSessionExpiredPopup();
            } else {
                console.log("❌ API CALL ERROR:", result.error);
                setHasValidToken(false);
                setIsCheckingToken(false);
                showSessionExpiredPopup();
            }
        } catch (error) {
            console.log("❌ API CALL FAILED:", error);
            setHasValidToken(false);
            setIsCheckingToken(false);
            showSessionExpiredPopup();
        }
    };

    const fetchCashierActivitiesList = async (page: number = 1) => {
        const offset = (page - 1) * pageSize;
        try {
            const result = await getCashierActivitiesList(pageSize, offset);
            if (result.success) {
                setCashierActivitiesData(result.data);
                setCurrentPage(page);
                console.log("✅ Cashier activities list fetched successfully");
            }
        } catch (error) {
            console.error("❌ Failed to fetch cashier activities list:", error);
        }
    };

    const showSessionExpiredPopup = () => {
        console.log("⚠️ Showing session expired popup");

        let timerInterval: NodeJS.Timeout;

        Swal.fire({
            icon: "warning",
            title: "Session Expired",
            html: `
        <div class="text-sm text-gray-600 mb-4">
          Your session has expired. Please login again.
        </div>
        <div class="text-xs text-gray-500">
          This popup will close automatically in <strong id="timer">3</strong> seconds
        </div>
      `,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: true,
            confirmButtonText: "Login Now",
            confirmButtonColor: "#025CCA",
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
                popup: "rounded-xl shadow-2xl",
                confirmButton: "rounded-lg px-6 py-2 font-medium",
                title: "text-lg font-bold text-red-600",
                htmlContainer: "text-sm",
            },
            background: "#ffffff",
            color: "#1f2937",
            didOpen: () => {
                const timer = Swal.getPopup()?.querySelector("#timer");
                let remainingTime = 3;

                timerInterval = setInterval(() => {
                    remainingTime--;
                    if (timer) {
                        timer.textContent = remainingTime.toString();
                    }

                    if (remainingTime <= 0) {
                        clearInterval(timerInterval);
                    }
                }, 1000);
            },
            willClose: () => {
                clearInterval(timerInterval);
            },
        }).then((result) => {
            console.log("🔥 Session expired popup result:", result);

            if (
                result.isConfirmed ||
                result.dismiss === Swal.DismissReason.timer
            ) {
                console.log("➡️ Opening login dialog");
                setIsLoginDialogOpen(true);
            }
        });
    };

    const handleLoginSuccess = async (userData: any) => {
        console.log("✅ Login successful:", userData);
        setHasValidToken(true);
        setIsLoginDialogOpen(false);

        // Fetch cashier activities list after login
        await fetchCashierActivitiesList();
    };

    const handleLoginClose = () => {
        console.log("❌ Login dialog closed without login");
        setIsLoginDialogOpen(false);
        onClose();
    };

    const handleLogoutAndClose = async () => {
        try {
            await logout();
            console.log("✅ User logged out successfully");
        } catch (error) {
            console.error("❌ Logout error:", error);
        }

        // Reset states
        setSearchInput("");
        setSearchTerm("");
        setCurrentPage(1);
        setSelectedIndex(-1);
        setSelectedItem(null);
        setCashierActivitiesData(null);

        onClose();
    };

    const handleSearchReset = () => {
        setSearchInput("");
        setSearchTerm("");
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        const filteredData = filterCashierActivities(
            cashierActivitiesData,
            searchTerm
        );
        if (page < 1 || page > (filteredData?.totalPages || 1)) return;
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
        setIsPageSizeOpen(false);
    };

    const handleRowClick = (item: any, index: number) => {
        setSelectedIndex(index);
        setSelectedItem(item);
    };

    const handleRowHover = (index: number) => {
        setSelectedIndex(index);
    };

    const handleSubmitWithLogout = async () => {
        if (!selectedItem) {
            console.error("❌ No item selected for reclose");
            return;
        }

        if (!deviceId) {
            console.error("❌ Device ID not available for reclosing cashier");
            return;
        }

        try {
            console.log("🔄 Starting reclose cashier process...");

            const result = await recloseActivity(deviceId, selectedItem.kode);

            if (result.success) {
                console.log("✅ Cashier activity reclosed successfully");
                onSubmit();
                await logout();
                console.log("✅ User logged out successfully after submit");
            } else if (result.isSessionExpired) {
                console.log("❌ Session expired during reclose cashier");
                showSessionExpiredPopup();
            } else {
                console.error("❌ Failed to reclose cashier:", result.error);
            }
        } catch (error) {
            console.error("❌ Error during reclose cashier process:", error);
        }
    };

    if (!isOpen) return null;

    if (isCheckingToken || isSystemLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="bg-white rounded-lg p-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span>
                            {isCheckingToken
                                ? "Checking authentication..."
                                : "Loading system information..."}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (systemError) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={handleLogoutAndClose}
                ></div>
                <div className="bg-white rounded-lg p-8 relative z-10 max-w-md mx-4">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            System Error
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            {systemError}
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={refetchSystemInfo}
                                className="flex-1"
                            >
                                Retry
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleLogoutAndClose}
                                className="flex-1"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!hasValidToken) {
        return (
            <EmployeeLoginDialog
                isOpen={isLoginDialogOpen}
                onClose={handleLoginClose}
                onLogin={handleLoginSuccess}
            />
        );
    }

    // Apply search filter
    const filteredData = filterCashierActivities(
        cashierActivitiesData,
        searchTerm
    );
    const displayData = filteredData?.docs || [];
    const totalPages = filteredData?.totalPages || 1;
    const totalDocs = filteredData?.totalDocs || 0;

    // Pagination for display
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = displayData.slice(startIndex, endIndex);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#f5f5f5] rounded-2xl w-full max-w-4xl max-h-[98vh] flex flex-col shadow-2xl p-5">
                <div className="flex items-center justify-between mb-5 border-gray-200">
                    <h2 className="text-2xl font-semibold text-black">
                        Re-Close Cashier (Tutup Kasir Ulang)
                    </h2>
                    <button
                        onClick={handleLogoutAndClose}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-black hover:scale-105 transition-all"
                    >
                        <X className="h-4 w-4 text-gray-600" />
                    </button>
                </div>

                <div className="bg-white rounded-2xl p-5 flex flex-col flex-1 min-h-0">
                    <div className="mb-5 border-gray-200">
                        <div className="relative">
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search cashier activities (min 3 characters) - Use PageUp/PageDown to navigate"
                                className="pl-10 pr-10 bg-[#F5F5F5] h-12 border-none"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            {searchInput && (
                                <button
                                    onClick={handleSearchReset}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Clear search"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0 rounded-2xl border border-[#F5F5F5] overflow-hidden">
                        <div
                            ref={tableContainerRef}
                            className="flex-1 overflow-auto"
                            style={{ maxHeight: "400px" }}
                        >
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 z-20 bg-[#F5F5F5]">
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[150px] bg-[#F5F5F5]">
                                            Cashier Name
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[120px] bg-[#F5F5F5]">
                                            Cashier Code
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[80px] bg-[#F5F5F5]">
                                            Kassa
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[80px] bg-[#F5F5F5]">
                                            Shift
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[100px] bg-[#F5F5F5]">
                                            Open
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[100px] bg-[#F5F5F5]">
                                            Closing
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[100px] bg-[#F5F5F5]">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {!cashierActivitiesData?.docs ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="text-center py-20"
                                            >
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                    <span className="ml-2 text-gray-600">
                                                        Loading cashier
                                                        activities...
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : paginatedData.length > 0 ? (
                                        paginatedData.map(
                                            (data: any, index: number) => {
                                                const rowClassName = `border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                                                    index === selectedIndex
                                                        ? "bg-blue-100 border-blue-300 shadow-sm"
                                                        : "hover:bg-blue-50"
                                                }`;

                                                return (
                                                    <tr
                                                        key={data.kode}
                                                        className={rowClassName}
                                                        onClick={() =>
                                                            handleRowClick(
                                                                data,
                                                                index
                                                            )
                                                        }
                                                        onMouseEnter={() =>
                                                            handleRowHover(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <td className="h-[48px] px-4 text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                                            {data.cashier
                                                                ?.fullname ||
                                                                "-"}
                                                        </td>
                                                        <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                            {data.cashier
                                                                ?.username ||
                                                                "-"}
                                                        </td>
                                                        <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                            {data.kd_kassa ||
                                                                "-"}
                                                        </td>
                                                        <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                            {data.shift || "-"}
                                                        </td>
                                                        <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                            {data.jam_opening ||
                                                                "-"}
                                                        </td>
                                                        <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                            {data.jam_closing ||
                                                                "-"}
                                                        </td>
                                                        <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                            {data.tanggal
                                                                ? new Date(
                                                                      data.tanggal
                                                                  ).toLocaleDateString(
                                                                      "en-GB"
                                                                  )
                                                                : "-"}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="p-8 text-center text-gray-500"
                                            >
                                                {searchTerm.trim()
                                                    ? `No cashier activities found for "${searchTerm}".`
                                                    : "No cashier activities found."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {displayData.length > 0 && (
                        <div className="mt-5 flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        Show
                                    </span>
                                    <div className="relative">
                                        <button
                                            onClick={() =>
                                                setIsPageSizeOpen(
                                                    !isPageSizeOpen
                                                )
                                            }
                                            className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 text-sm"
                                        >
                                            {pageSize}
                                            <ChevronDown size={14} />
                                        </button>
                                        {isPageSizeOpen && (
                                            <div className="absolute bottom-full mb-1 left-0 bg-white border border-gray-200 rounded shadow-lg z-10">
                                                {pageSizeOptions.map(
                                                    (option) => (
                                                        <button
                                                            key={option}
                                                            onClick={() =>
                                                                handlePageSizeChange(
                                                                    option
                                                                )
                                                            }
                                                            className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                                                option ===
                                                                pageSize
                                                                    ? "bg-blue-50 text-blue-600"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {option}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        from {totalDocs}
                                    </span>
                                </div>
                            </div>
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    size="sm"
                                />
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-5 flex-shrink-0">
                    <Button
                        onClick={handleSubmitWithLogout}
                        disabled={!selectedItem || isReclosing}
                        className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-white font-medium rounded-lg"
                    >
                        {isReclosing ? "Processing..." : "Submit"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReCloseCashierDialog;
