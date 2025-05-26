"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Search, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "./pagination";

interface Product {
  id: string;
  sku: string;
  name: string;
  dept: string;
  satuan: string;
  hjEcer: string;
  hjSwalayan: string;
  hjPerpack: string;
  isi: string;
  strip: string;
  obbs: string;
  barcode: string;
  selected?: boolean;
}

interface SelectProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function SelectProductDialog({
  isOpen,
  onClose,
  onSelectProduct,
}: SelectProductDialogProps) {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Sample product data based on the Figma design
  const products: Product[] = useMemo(
    () => [
      {
        id: "1",
        sku: "140788",
        name: "3M Steri- Dual ECO",
        dept: "H3",
        satuan: "BOX",
        hjEcer: "Rp 12.000",
        hjSwalayan: "Rp 12.000",
        hjPerpack: "Rp 12.000",
        isi: "40",
        strip: "4",
        obbs: "4",
        barcode: "8995614078",
      },
      {
        id: "2",
        sku: "136295",
        name: "33 Green Propolis 10G",
        dept: "H3",
        satuan: "PCS",
        hjEcer: "Rp 3.700",
        hjSwalayan: "Rp 3.700",
        hjPerpack: "Rp 3.700",
        isi: "1",
        strip: "1",
        obbs: "1",
        barcode: "899561362",
      },
      {
        id: "3",
        sku: "200441",
        name: "7 Day AM/PM Pillreminder",
        dept: "A2",
        satuan: "PCS",
        hjEcer: "Rp 7.000",
        hjSwalayan: "Rp 7.000",
        hjPerpack: "Rp 7.000",
        isi: "1",
        strip: "1",
        obbs: "1",
        barcode: "8995620041",
      },
      {
        id: "4",
        sku: "139803",
        name: "Abikal 400mg Tablet",
        dept: "A2",
        satuan: "FLS",
        hjEcer: "Rp 2.500",
        hjSwalayan: "Rp 2.500",
        hjPerpack: "Rp 2.500",
        isi: "1",
        strip: "1",
        obbs: "1",
        barcode: "8995613980",
      },
      {
        id: "5",
        sku: "200041",
        name: "Abomax 500mg Capsul",
        dept: "H3",
        satuan: "PCS",
        hjEcer: "Rp 8.300",
        hjSwalayan: "Rp 8.300",
        hjPerpack: "Rp 8.300",
        isi: "1",
        strip: "1",
        obbs: "1",
        barcode: "8995620041",
      },
      {
        id: "6",
        sku: "136295",
        name: "Abate 10G Tablet",
        dept: "A2",
        satuan: "PCS",
        hjEcer: "Rp 4.900",
        hjSwalayan: "Rp 4.900",
        hjPerpack: "Rp 4.900",
        isi: "1",
        strip: "1",
        obbs: "1",
        barcode: "8995613629",
      },
      {
        id: "7",
        sku: "132356",
        name: "Abdec Plus Syrup 120ml",
        dept: "A2",
        satuan: "PCS",
        hjEcer: "Rp 7.200",
        hjSwalayan: "Rp 7.200",
        hjPerpack: "Rp 7.200",
        isi: "1",
        strip: "0",
        obbs: "1",
        barcode: "8995613235",
      },
      {
        id: "8",
        sku: "148356",
        name: "Absolute FH menopause 60ml",
        dept: "H3",
        satuan: "PCS",
        hjEcer: "Rp 4.400",
        hjSwalayan: "Rp 4.400",
        hjPerpack: "Rp 4.400",
        isi: "2",
        strip: "2",
        obbs: "2",
        barcode: "8995614835",
      },
      {
        id: "9",
        sku: "142058",
        name: "Accu Check Avtive meter Extra",
        dept: "H3",
        satuan: "PCS",
        hjEcer: "Rp 3.300",
        hjSwalayan: "Rp 3.300",
        hjPerpack: "Rp 3.300",
        isi: "8",
        strip: "1",
        obbs: "8",
        barcode: "8995614205",
      },
      {
        id: "10",
        sku: "148256",
        name: "Acetazolamide 250mg Tablet",
        dept: "A2",
        satuan: "PCS",
        hjEcer: "Rp 2.900",
        hjSwalayan: "Rp 2.900",
        hjPerpack: "Rp 2.900",
        isi: "10",
        strip: "1",
        obbs: "10",
        barcode: "8995614825",
      },
    ],
    []
  );

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const itemsPerPage = 7;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle search
  const handleSearch = () => {
    setSearchTerm(searchInput);
    setIsSearchActive(searchInput.trim() !== "");
    setCurrentPage(1);
  };

  // Handle search toggle (reset)
  const handleSearchToggle = () => {
    setSearchInput("");
    setSearchTerm("");
    setIsSearchActive(false);
    setCurrentPage(1);
  };

  // Handle product selection
  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product);
    onClose();
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] z-50 flex items-center justify-center">
      <div className="w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header - Outside white background */}
        <div className="flex items-center py-3">
          <button onClick={onClose} className="mr-4">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold flex-grow">Select Product</h2>
          <Button className="bg-blue-600">
            <Plus size={16} className="mr-2" />
            Add Product
          </Button>
        </div>

        {/* White background container */}
        <div className="bg-white rounded-lg overflow-hidden flex-grow flex flex-col p-4">
          {/* Search bar */}
          <div className="py-4">
            <div className="relative flex">
              <Input
                type="text"
                placeholder="Search here"
                className="pl-10 bg-[#F5F5F5] border-none flex-grow mr-2 h-10"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              {isSearchActive ? (
                <Button
                  variant="destructive"
                  onClick={handleSearchToggle}
                  className="flex items-center h-10"
                >
                  <X size={16} className="mr-2" /> Reset
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleSearch}
                  className="flex items-center h-10"
                >
                  Search
                </Button>
              )}
            </div>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 bg-[#F5F5F5] py-2 px-4 rounded-lg font-medium text-gray-600">
            <div className="col-span-1">#</div>
            <div className="col-span-1">SKU</div>
            <div className="col-span-2">Product Name</div>
            <div className="col-span-1">Dept</div>
            <div className="col-span-1">Satuan</div>
            <div className="col-span-1">HJ Ecer</div>
            <div className="col-span-1">HJ Swalayan</div>
            <div className="col-span-1">HJ Perpack</div>
            <div className="col-span-1">Isi</div>
            <div className="col-span-1">Strip</div>
            <div className="col-span-1">Obbs</div>
          </div>

          {/* Table rows */}
          <div className="flex-grow overflow-y-auto">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`grid grid-cols-12 p-4 hover:bg-blue-50 cursor-pointer ${
                    index % 2 === 1 ? "bg-gray-50/50" : ""
                  }`}
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className="col-span-1 flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full mr-2 ${
                        ["1", "2", "9"].includes(product.id)
                          ? "bg-red-500"
                          : "bg-transparent"
                      }`}
                    ></div>
                    {index + 1 + (currentPage - 1) * itemsPerPage}
                  </div>
                  <div className="col-span-1">{product.sku}</div>
                  <div className="col-span-2">{product.name}</div>
                  <div className="col-span-1">{product.dept}</div>
                  <div className="col-span-1">{product.satuan}</div>
                  <div className="col-span-1">{product.hjEcer}</div>
                  <div className="col-span-1">{product.hjSwalayan}</div>
                  <div className="col-span-1">{product.hjPerpack}</div>
                  <div className="col-span-1">{product.isi}</div>
                  <div className="col-span-1">{product.strip}</div>
                  <div className="col-span-1">{product.obbs}</div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No products found.
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="p-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
