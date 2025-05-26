"use client";

import { useState } from "react";
import { Info, Trash, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SelectProductDialog from "./select-product-dialog";

interface DialogProduct {
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
}

interface ProductTableProps {
  products: Product[];
  onQuantityChange: (id: number, quantity: number) => void;
  onRemoveProduct: (id: number) => void;
  onAddProduct?: (product: Product) => void;
  onProductNameClick?: (id: number) => void;
  onProductSelect?: (selectedProduct: DialogProduct, productId: number) => void;
  className?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  sc: number;
  misc: number;
  subtotal: number;
}

export default function ProductTable({
  products,
  onQuantityChange,
  onRemoveProduct,
  onAddProduct,
  onProductNameClick,
  onProductSelect,
  className = "",
}: ProductTableProps) {
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);

  const handleProductNameClick = (productId: number) => {
    if (onProductNameClick) {
      onProductNameClick(productId);
    } else {
      // Open the product selection dialog and store the current product ID
      setCurrentProductId(productId);
      setIsProductDialogOpen(true);
    }
  };

  const handleProductSelect = (selectedProduct: DialogProduct) => {
    if (currentProductId !== null && onProductSelect) {
      onProductSelect(selectedProduct, currentProductId);
    }
    setIsProductDialogOpen(false);
  };

  return (
    <div className={`${className} bg-white p-4 rounded-2xl`}>
      {/* Table Header */}
      <div className="border-[1px] border-solid border-[#F5F5F5] rounded-xl">
        <div className="grid grid-cols-12 p-3 bg-gray-100 text-sm font-medium text-gray-600 rounded-t-xl">
          <div className="col-span-4">Product Name</div>
          <div className="col-span-1">Price</div>
          <div className="col-span-1">Qty</div>
          <div className="col-span-1">Disc %</div>
          <div className="col-span-1">SC</div>
          <div className="col-span-1">Misc</div>
          <div className="col-span-2">Sub Total</div>
          <div className="col-span-1">Action</div>
        </div>

        {/* Table Body */}
        <div>
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`grid grid-cols-12 p-3 items-center text-sm hover:bg-blue-50 ${
                index % 2 === 1 ? "bg-gray-50/50" : ""
              }`}
            >
              <div className="col-span-4 flex items-center">
                {product.name ? (
                  <>
                    <button className="text-blue-500 mr-1">
                      <Info size={16} />
                    </button>
                    <span
                      className="cursor-pointer hover:text-blue-600"
                      onClick={() => handleProductNameClick(product.id)}
                    >
                      {product.name}
                    </span>
                  </>
                ) : (
                  <Input
                    placeholder="Can name product disini"
                    className="border-gray-200 text-sm w-10/12 cursor-pointer"
                    onClick={() => handleProductNameClick(product.id)}
                    readOnly
                  />
                )}
              </div>
              <div className="col-span-1  w-10/12">
                {product.price > 0 ? `Rp ${product.price.toLocaleString()}` : 0}
              </div>
              <div className="col-span-1  w-10/12">
                <Input
                  type="number"
                  value={product.quantity || ""}
                  onChange={(e) =>
                    onQuantityChange(product.id, parseInt(e.target.value) || 0)
                  }
                  className="w-full text-sm border-gray-200"
                />
              </div>
              <div className="col-span-1  w-10/12">
                <Input
                  type="number"
                  value={product.discount}
                  className="w-full text-sm border-gray-200"
                />
              </div>
              <div className="col-span-1 w-10/12">{`Rp ${product.sc}`}</div>
              <div className="col-span-1 w-10/12">{`Rp ${product.misc}`}</div>
              <div className="col-span-2">
                {product.subtotal > 0
                  ? `Rp ${product.subtotal.toLocaleString()}`
                  : 0}
              </div>
              <div className="col-span-1 flex space-x-1">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onRemoveProduct(product.id)}
                >
                  <Trash size={14} />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  className="h-6 w-6 bg-blue-500 hover:bg-blue-600"
                  onClick={() => onAddProduct && onAddProduct(product)}
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Selection Dialog */}
      <SelectProductDialog
        isOpen={isProductDialogOpen}
        onClose={() => setIsProductDialogOpen(false)}
        onSelectProduct={handleProductSelect}
      />
    </div>
  );
}
