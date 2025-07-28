// app/create-order/choose-menu/_components/TransactionHistoryDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Search, Calendar, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/shared/pagination";

interface TransactionData {
  receiptId: string;
  date: string;
  time: string;
  cashierName: string;
  kassa: number;
  shift: number;
  customerName: string;
  address: string;
  phone: string;
}

interface TransactionProduct {
  productId: string;
  productName: string;
  qty: number;
  unitsIsi: number;
  subTotal: number;
  misc: number;
  discPercent: number;
  discRp: number;
  ru: number;
}

interface TransactionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransactionHistoryDialog: React.FC<TransactionHistoryDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionData | null>(null);
  const [selectedDate, setSelectedDate] = useState("06/07/2024");
  const [isLoading, setIsLoading] = useState(false);

  // Product table pagination states
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const [productPageSize, setProductPageSize] = useState(5);
  const [isProductPageSizeOpen, setIsProductPageSizeOpen] = useState(false);

  // Mock transaction data
  const mockTransactions: TransactionData[] = [
    {
      receiptId: "G2240425217",
      date: "05/12/2024",
      time: "23:03:12",
      cashierName: "Ahmad Isco",
      kassa: 1,
      shift: 2,
      customerName: "Agis Grant Mcdaniel",
      address: "Jl. Merdeka No. 12, Jakarta Pusat",
      phone: "+62812",
    },
    {
      receiptId: "G2240425218",
      date: "05/12/2024",
      time: "23:03:14",
      cashierName: "Abdul Rahman",
      kassa: 1,
      shift: 2,
      customerName: "Rachel Avila Suyono",
      address: "Jl. Sisingamangaraja No. 5, M...",
      phone: "+62813",
    },
    {
      receiptId: "G2240425219",
      date: "05/12/2024",
      time: "23:04:27",
      cashierName: "Paulina Maldini",
      kassa: 1,
      shift: 2,
      customerName: "Barbara Gardner Lim",
      address: "Jl. Pahlawan No. 20, Surabaya",
      phone: "+62814",
    },
    {
      receiptId: "G2240425256",
      date: "05/12/2024",
      time: "23:04:27",
      cashierName: "Maul Assenio",
      kassa: 1,
      shift: 2,
      customerName: "Ahmad Marta Murray",
      address: "Jl. Asia Afrika No. 33, Bandung",
      phone: "+62815",
    },
    {
      receiptId: "G2240425257",
      date: "05/12/2024",
      time: "23:04:27",
      cashierName: "Cristiano Udino",
      kassa: 1,
      shift: 2,
      customerName: "Ryan Nur Schultz",
      address: "Jl. Diponegoro No. 11, Semara...",
      phone: "+62816",
    },
    // Additional data for pagination testing
    {
      receiptId: "G2240425258",
      date: "05/12/2024",
      time: "23:05:10",
      cashierName: "John Doe",
      kassa: 2,
      shift: 1,
      customerName: "Alice Johnson",
      address: "Jl. Sudirman No. 45, Jakarta",
      phone: "+62817",
    },
    {
      receiptId: "G2240425259",
      date: "05/12/2024",
      time: "23:05:25",
      cashierName: "Jane Smith",
      kassa: 2,
      shift: 1,
      customerName: "Bob Wilson",
      address: "Jl. Thamrin No. 67, Jakarta",
      phone: "+62818",
    },
    {
      receiptId: "G2240425260",
      date: "05/12/2024",
      time: "23:06:00",
      cashierName: "Mike Johnson",
      kassa: 1,
      shift: 2,
      customerName: "Carol Brown",
      address: "Jl. Gatot Subroto No. 89, Jakarta",
      phone: "+62819",
    },
    {
      receiptId: "G2240425261",
      date: "05/12/2024",
      time: "23:06:15",
      cashierName: "Sarah Davis",
      kassa: 3,
      shift: 1,
      customerName: "David Miller",
      address: "Jl. Casablanca No. 12, Jakarta",
      phone: "+62820",
    },
    {
      receiptId: "G2240425262",
      date: "05/12/2024",
      time: "23:06:30",
      cashierName: "Tom Wilson",
      kassa: 2,
      shift: 2,
      customerName: "Eva Garcia",
      address: "Jl. Kuningan No. 34, Jakarta",
      phone: "+62821",
    },
    {
      receiptId: "G2240425263",
      date: "05/12/2024",
      time: "23:07:00",
      cashierName: "Lisa Anderson",
      kassa: 1,
      shift: 1,
      customerName: "Frank Martinez",
      address: "Jl. Senayan No. 56, Jakarta",
      phone: "+62822",
    },
    {
      receiptId: "G2240425264",
      date: "05/12/2024",
      time: "23:07:15",
      cashierName: "Chris Taylor",
      kassa: 3,
      shift: 2,
      customerName: "Grace Lee",
      address: "Jl. Menteng No. 78, Jakarta",
      phone: "+62823",
    },
  ];

  // Mock product data for selected transaction - extended for pagination
  const mockProducts: TransactionProduct[] = [
    {
      productId: "123987",
      productName: "Jamu Tolak Angin + Madu",
      qty: 1,
      unitsIsi: 2,
      subTotal: 12000,
      misc: 0,
      discPercent: 0,
      discRp: 0,
      ru: 0,
    },
    {
      productId: "187675",
      productName: "Blackmores Multivitamin",
      qty: 1,
      unitsIsi: 2,
      subTotal: 56000,
      misc: 0,
      discPercent: 0,
      discRp: 0,
      ru: 0,
    },
    {
      productId: "199687",
      productName: "Kurukumes Syrup 60ml",
      qty: 1,
      unitsIsi: 2,
      subTotal: 67000,
      misc: 0,
      discPercent: 0,
      discRp: 0,
      ru: 0,
    },
    {
      productId: "197325",
      productName: "Alami Biscuit Seaweed",
      qty: 1,
      unitsIsi: 2,
      subTotal: 82500,
      misc: 0,
      discPercent: 0,
      discRp: 0,
      ru: 0,
    },
    // Additional products for pagination testing
    {
      productId: "201234",
      productName: "Vitamin D3 1000IU",
      qty: 2,
      unitsIsi: 1,
      subTotal: 45000,
      misc: 0,
      discPercent: 0,
      discRp: 0,
      ru: 0,
    },
    {
      productId: "205678",
      productName: "Omega 3 Fish Oil",
      qty: 1,
      unitsIsi: 3,
      subTotal: 89000,
      misc: 0,
      discPercent: 5,
      discRp: 4450,
      ru: 0,
    },
    {
      productId: "209876",
      productName: "Probiotics Capsules",
      qty: 1,
      unitsIsi: 2,
      subTotal: 125000,
      misc: 0,
      discPercent: 0,
      discRp: 0,
      ru: 0,
    },
    {
      productId: "213456",
      productName: "Calcium + Magnesium",
      qty: 3,
      unitsIsi: 1,
      subTotal: 67500,
      misc: 0,
      discPercent: 10,
      discRp: 6750,
      ru: 0,
    },
    {
      productId: "217890",
      productName: "Iron Supplement",
      qty: 2,
      unitsIsi: 2,
      subTotal: 34000,
      misc: 0,
      discPercent: 0,
      discRp: 0,
      ru: 0,
    },
    {
      productId: "221234",
      productName: "B-Complex Vitamins",
      qty: 1,
      unitsIsi: 1,
      subTotal: 78000,
      misc: 0,
      discPercent: 0,
      discRp: 0,
      ru: 0,
    },
    {
      productId: "225678",
      productName: "Zinc Tablets",
      qty: 2,
      unitsIsi: 3,
      subTotal: 23000,
      misc: 0,
      discPercent: 0,
      discRp: 0,
      ru: 0,
    },
    {
      productId: "229876",
      productName: "Coenzyme Q10",
      qty: 1,
      unitsIsi: 2,
      subTotal: 156000,
      misc: 0,
      discPercent: 15,
      discRp: 23400,
      ru: 0,
    },
  ];

  const pageSizeOptions = [5, 10, 25, 50];

  // Filter and paginate transaction data
  const filteredTransactions = mockTransactions.filter(
    (transaction) =>
      transaction.customerName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.receiptId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + pageSize
  );

  // Product pagination
  const productTotalPages = Math.ceil(mockProducts.length / productPageSize);
  const productStartIndex = (productCurrentPage - 1) * productPageSize;
  const paginatedProducts = mockProducts.slice(
    productStartIndex,
    productStartIndex + productPageSize
  );

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setPageSize(5);
      setSearchInput("");
      setSearchTerm("");
      setSelectedTransaction(null);
      setIsPageSizeOpen(false);
      // Reset product pagination
      setProductCurrentPage(1);
      setProductPageSize(5);
      setIsProductPageSizeOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  if (!isOpen) return null;

  const handleRowClick = (transaction: TransactionData) => {
    setSelectedTransaction(
      selectedTransaction?.receiptId === transaction.receiptId
        ? null
        : transaction
    );
    // Reset product pagination when selecting new transaction
    setProductCurrentPage(1);
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

  const handleProductPageChange = (page: number) => {
    if (page < 1 || page > productTotalPages) return;
    setProductCurrentPage(page);
  };

  const handleProductPageSizeChange = (newPageSize: number) => {
    setProductPageSize(newPageSize);
    setProductCurrentPage(1);
    setIsProductPageSizeOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Transaction History
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search and Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search Customer Name or Receipt ID"
                className="pl-10 bg-[#F5F5F5] border-none h-12"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-32 h-12"
                placeholder="DD/MM/YYYY"
              />
            </div>
            <Button
              variant="outline"
              className="h-12 px-4 bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Transactions Table */}
          <div className="rounded-lg border border-gray-200 overflow-hidden mb-6">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#F5F5F5] border-b border-gray-200">
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[130px]">
                    Receipt ID
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[100px]">
                    Date
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[80px]">
                    Time
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[120px]">
                    Cashier Name
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[80px]">
                    Kassa
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[80px]">
                    Shift
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 min-w-[150px]">
                    Customer Name
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 min-w-[200px]">
                    Address
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[100px]">
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-20">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-600">
                          Loading transactions...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction, index) => (
                    <tr
                      key={transaction.receiptId}
                      className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                        selectedTransaction?.receiptId === transaction.receiptId
                          ? "bg-blue-50 border-2 border-blue-400"
                          : "border-2 border-transparent"
                      }`}
                      onClick={() => handleRowClick(transaction)}
                    >
                      <td className="h-[48px] px-4 text-sm font-medium text-gray-900">
                        {transaction.receiptId}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {transaction.date}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {transaction.time}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {transaction.cashierName}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {transaction.kassa}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {transaction.shift}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-900">
                        {transaction.customerName}
                      </td>
                      <td
                        className="h-[48px] px-4 text-sm text-gray-600"
                        title={transaction.address}
                      >
                        {transaction.address}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {transaction.phone}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                      {searchTerm
                        ? "No transactions found for your search."
                        : "No transactions found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination for transactions */}
          {paginatedTransactions.length > 0 && (
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show</span>
                  <div className="relative">
                    <button
                      onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
                      className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 text-sm"
                    >
                      {pageSize}
                      <ChevronDown size={14} />
                    </button>
                    {isPageSizeOpen && (
                      <div className="absolute bottom-full mb-1 left-0 bg-white border border-gray-200 rounded shadow-lg z-10">
                        {pageSizeOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => handlePageSizeChange(option)}
                            className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                              option === pageSize
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    from {filteredTransactions.length}
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

          {/* Product Details */}
          {selectedTransaction && (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transaction Details - {selectedTransaction.receiptId}
                </h3>
              </div>
              <table className="w-full">
                <thead className="sticky top-0 bg-[#F5F5F5]">
                  <tr className="border-b border-gray-200">
                    <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[60px]">
                      R
                    </th>
                    <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[100px]">
                      Product ID
                    </th>
                    <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 min-w-[200px]">
                      Product Name
                    </th>
                    <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[60px]">
                      Qty
                    </th>
                    <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[80px]">
                      Units (Isi)
                    </th>
                    <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[100px]">
                      Sub Total
                    </th>
                    <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[80px]">
                      Misc
                    </th>
                    <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[80px]">
                      Disc (%)
                    </th>
                    <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[80px]">
                      Disc (Rp)
                    </th>
                    <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[80px]">
                      RU
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product, index) => (
                    <tr
                      key={product.productId}
                      className="border-b border-gray-100"
                    >
                      <td className="h-[40px] px-4 text-sm text-gray-600">
                        {productStartIndex + index + 1}
                      </td>
                      <td className="h-[40px] px-4 text-sm font-medium text-gray-900">
                        {product.productId}
                      </td>
                      <td className="h-[40px] px-4 text-sm text-gray-900">
                        {product.productName}
                      </td>
                      <td className="h-[40px] px-4 text-sm text-gray-600">
                        {product.qty}
                      </td>
                      <td className="h-[40px] px-4 text-sm text-gray-600">
                        {product.unitsIsi}
                      </td>
                      <td className="h-[40px] px-4 text-sm text-gray-900">
                        {formatCurrency(product.subTotal)}
                      </td>
                      <td className="h-[40px] px-4 text-sm text-gray-600">
                        {formatCurrency(product.misc)}
                      </td>
                      <td className="h-[40px] px-4 text-sm text-gray-600">
                        {product.discPercent}%
                      </td>
                      <td className="h-[40px] px-4 text-sm text-gray-600">
                        {formatCurrency(product.discRp)}
                      </td>
                      <td className="h-[40px] px-4 text-sm text-gray-600">
                        {formatCurrency(product.ru)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Product Pagination */}
              {mockProducts.length > 0 && (
                <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Show</span>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setIsProductPageSizeOpen(!isProductPageSizeOpen)
                          }
                          className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 text-sm"
                        >
                          {productPageSize}
                          <ChevronDown size={14} />
                        </button>
                        {isProductPageSizeOpen && (
                          <div className="absolute bottom-full mb-1 left-0 bg-white border border-gray-200 rounded shadow-lg z-10">
                            {pageSizeOptions.map((option) => (
                              <button
                                key={option}
                                onClick={() =>
                                  handleProductPageSizeChange(option)
                                }
                                className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                  option === productPageSize
                                    ? "bg-blue-50 text-blue-600"
                                    : ""
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        from {mockProducts.length}
                      </span>
                    </div>
                  </div>
                  {productTotalPages > 1 && (
                    <Pagination
                      currentPage={productCurrentPage}
                      totalPages={productTotalPages}
                      onPageChange={handleProductPageChange}
                      size="sm"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryDialog;
