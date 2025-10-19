"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, ChevronDown } from "lucide-react";
import { FC, useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSystemInfo } from "@/hooks/useSystemInfo";
import { useCashierActivity, CashierActivityData } from "@/hooks/useCashierActivity";
import { UserData } from "@/types/user";
import { useCloseCashierActivity } from "@/hooks/useCloseCashierActivity";
import EmployeeLoginDialog from "@/components/shared/EmployeeLoginDialog";
import Pagination from "@/components/shared/pagination";
import Swal from "sweetalert2";

interface CloseCashierDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

const CloseCashierDialog: FC<CloseCashierDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [hasValidToken, setHasValidToken] = useState(false);
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
    const [isCheckingToken, setIsCheckingToken] = useState(true);
    const [cashierActivityData, setCashierActivityData] = useState<CashierActivityData | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDocs, setTotalDocs] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [filteredData, setFilteredData] = useState<CashierActivityData | null>(null);
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
    const { closeCashierActivity, isLoading: isClosingCashier } =
        useCloseCashierActivity();

    const handleLogoutAndClose = useCallback(async () => {
        try {
            await logout();
        } catch (_error) {
            console.error("❌ Logout error:", _error);
        }

        setSearchInput("");
        setSearchTerm("");
        setCurrentPage(1);
        setSelectedIndex(-1);
        setCashierActivityData(null);
        setFilteredData(null);

        onClose();
    }, [logout, onClose]);

    const handleSubmitWithLogout = useCallback(async () => {
        if (!deviceId) {
            console.error("❌ Device ID not available for closing cashier");
            showErrorAlert("Device ID not available for closing cashier");
            return;
        }

        try {
            const result = await closeCashierActivity(deviceId);

            if (result.success) {
                showSuccessAlert(
                    "Cashier activity has been closed successfully!"
                );
                setTimeout(async () => {
                    onSubmit();
                    await logout();
                }, 1500);
            } else if (result.isSessionExpired) {
                showSessionExpiredPopup();
            } else {
                console.error("❌ Failed to close cashier:", result.error);
                showErrorAlert(
                    result.error || "Failed to close cashier activity"
                );
            }
        } catch (_error) {
            console.error("❌ Error during close cashier process:", _error);
            showErrorAlert(
                "An unexpected error occurred while closing cashier"
            );
        }
    }, [deviceId, closeCashierActivity, onSubmit, logout]);

    const checkTokenStatus = useCallback(async () => {
        setIsCheckingToken(true);

        if (!deviceId) {
            await refetchSystemInfo();
            return;
        }

        try {
            const result = await checkCashierActivity(deviceId);

            if (result.success) {
                setCashierActivityData(result.data || null);
                setHasValidToken(true);
                setIsCheckingToken(false);
            } else if (result.isSessionExpired) {
                setHasValidToken(false);
                setIsCheckingToken(false);
                showSessionExpiredPopup();
            } else {
                setCashierActivityData(null);
                setHasValidToken(false);
                setIsCheckingToken(false);
                showSessionExpiredPopup();
            }
        } catch (error) {
            console.error("❌ Token check error:", error);
            setCashierActivityData(null);
            setHasValidToken(false);
            setIsCheckingToken(false);
            showSessionExpiredPopup();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deviceId]);

    const filterCashierData = (data: CashierActivityData | null, searchTerm: string) => {
        if (!data) return null;
        if (!searchTerm.trim()) return data;

        const search = searchTerm.toLowerCase();

        const matchesSearch =
            data.cashier?.fullname?.toLowerCase().includes(search) ||
            data.cashier?.username?.toLowerCase().includes(search) ||
            data.kd_kassa?.toLowerCase().includes(search) ||
            data.shift?.toString().includes(search);

        return matchesSearch ? data : null;
    };

    useEffect(() => {
        const filtered = filterCashierData(cashierActivityData, searchTerm);
        setFilteredData(filtered);
        setTotalDocs(filtered ? 1 : 0);
        setTotalPages(filtered ? 1 : 0);
        setCurrentPage(1);

        if (filtered) {
            setSelectedIndex(0);
        } else {
            setSelectedIndex(-1);
        }
    }, [searchTerm, cashierActivityData]);

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

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const isTypingInSearch =
                document.activeElement === searchInputRef.current &&
                (e.key.length === 1 ||
                    e.key === "Backspace" ||
                    e.key === "Delete");

            if (isTypingInSearch) return;

            switch (e.key) {
                case "PageDown":
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prevIndex) => {
                        if (filteredData && prevIndex === -1) {
                            return 0;
                        }
                        return filteredData ? Math.min(prevIndex + 1, 0) : -1;
                    });
                    break;

                case "PageUp":
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prevIndex) => {
                        if (filteredData && prevIndex === -1) {
                            return 0;
                        }
                        return Math.max(prevIndex - 1, 0);
                    });
                    break;

                case "Enter":
                    e.preventDefault();
                    if (selectedIndex >= 0 && filteredData) {
                        handleSubmitWithLogout();
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
    }, [isOpen, filteredData, selectedIndex, handleLogoutAndClose, handleSubmitWithLogout]);

    useEffect(() => {
        if (isOpen && deviceId) {
            checkTokenStatus();
            setSearchInput("");
            setSearchTerm("");

            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, deviceId]);

    const showSessionExpiredPopup = () => {
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
        }).then((result) => {if (
                result.isConfirmed ||
                result.dismiss === Swal.DismissReason.timer
            ) {setIsLoginDialogOpen(true);
            }
        });
    };

    const showSuccessAlert = (message: string) => {
        Swal.fire({
            icon: "success",
            title: "Close Cashier Success",
            text: message,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            customClass: {
                popup: "rounded-xl shadow-2xl",
                title: "text-lg font-bold text-green-600",
                htmlContainer: "text-sm",
            },
            background: "#ffffff",
            color: "#1f2937",
        });
    };

    const showErrorAlert = (message: string) => {
        Swal.fire({
            icon: "error",
            title: "Close Cashier Failed",
            text: message,
            confirmButtonText: "OK",
            confirmButtonColor: "#dc2626",
            customClass: {
                popup: "rounded-xl shadow-2xl",
                confirmButton: "rounded-lg px-6 py-2 font-medium",
                title: "text-lg font-bold text-red-600",
                htmlContainer: "text-sm",
            },
            background: "#ffffff",
            color: "#1f2937",
        });
    };

    const handleLoginSuccess = async (_userData: UserData) => {setHasValidToken(true);
        setIsLoginDialogOpen(false);

        if (deviceId) {
            try {
                const result = await checkCashierActivity(deviceId);
                if (result.success) {
                    setCashierActivityData(result.data || null);}
        } catch (_error) {
                console.error(
                    "❌ Failed to refresh cashier activity after login:",
                    _error
                );
            }
        }
    };

    const handleLoginClose = () => {setIsLoginDialogOpen(false);
        onClose();
    };



    const handleSearchReset = () => {
        setSearchInput("");
        setSearchTerm("");
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
        setIsPageSizeOpen(false);
    };

    const handleRowClick = () => {
        setSelectedIndex(0);
    };

    const handleRowHover = () => {
        setSelectedIndex(0);
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
                loginType="close-cashier"
            />
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#f5f5f5] rounded-2xl w-full max-w-4xl max-h-[98vh] flex flex-col shadow-2xl p-5">
                <div className="flex items-center justify-between mb-5 border-gray-200">
                    <h2 className="text-2xl font-semibold text-black">
                        Close Cashier (Tutup Kasir)
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
                                placeholder="Search cashier data (min 3 characters) - Use PageUp/PageDown to navigate"
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
                                    {filteredData ? (
                                        <tr
                                            className={`border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                                                selectedIndex === 0
                                                    ? "bg-blue-100 border-blue-300 shadow-sm"
                                                    : "hover:bg-blue-50"
                                            }`}
                                            onClick={handleRowClick}
                                            onMouseEnter={handleRowHover}
                                        >
                                            <td className="h-[48px] px-4 text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                                {filteredData?.cashier
                                                    ?.fullname || "-"}
                                            </td>
                                            <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                {filteredData?.cashier
                                                    ?.username || "-"}
                                            </td>
                                            <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                {filteredData?.kd_kassa || "-"}
                                            </td>
                                            <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                {filteredData?.shift || "-"}
                                            </td>
                                            <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                {filteredData?.jam_opening ||
                                                    "-"}
                                            </td>
                                            <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                {filteredData?.jam_closing ||
                                                    "-"}
                                            </td>
                                            <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                {filteredData?.tanggal
                                                    ? new Date(
                                                          filteredData.tanggal
                                                      ).toLocaleDateString(
                                                          "en-GB"
                                                      )
                                                    : "-"}
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="p-8 text-center text-gray-500"
                                            >
                                                {searchTerm.trim()
                                                    ? `No cashier data found for "${searchTerm}".`
                                                    : "No cashier data found."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {filteredData && (
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
                        disabled={isClosingCashier || !filteredData}
                        className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-white font-medium rounded-lg"
                    >
                        {isClosingCashier ? "Closing..." : "Submit"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CloseCashierDialog;
