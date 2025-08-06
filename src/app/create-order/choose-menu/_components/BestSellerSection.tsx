"use client";

import { FC, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BestSellerSection: FC = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const bestSellerProducts = [
        {
            id: "BS001",
            name: "Paracetamol 500mg",
            category: "Medicine",
            price: "Rp 5.000",
            stock: "150",
            sales: "1,250",
        },
        {
            id: "BS002",
            name: "Vitamin C 1000mg",
            category: "Supplement",
            price: "Rp 15.000",
            stock: "89",
            sales: "890",
        },
        {
            id: "BS003",
            name: "Betadine Solution",
            category: "Antiseptic",
            price: "Rp 25.000",
            stock: "45",
            sales: "456",
        },
    ];

    return (
        <div className="p-4">
            <div className="flex mb-4">
                <div className="relative flex-grow mr-2">
                    <Input
                        type="text"
                        placeholder="Search Product Name"
                        className="pl-10 bg-[#F5F5F5] border-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                    />
                </div>
                <Button
                    variant="default"
                    className="bg-blue-500 hover:bg-blue-600"
                >
                    Search
                </Button>
            </div>

            <div>
                <div className="grid grid-cols-6 p-3 text-sm font-medium text-gray-600 bg-[#F5F5F5] rounded-xl">
                    <div>Product ID</div>
                    <div>Product Name</div>
                    <div>Category</div>
                    <div>Price</div>
                    <div>Stock</div>
                    <div>Sales</div>
                </div>

                <div>
                    {bestSellerProducts.map((item, index) => (
                        <div
                            key={item.id}
                            className={`grid grid-cols-6 p-3 items-center text-sm cursor-pointer hover:bg-blue-50 ${
                                index % 2 === 1 ? "bg-gray-50/50" : ""
                            }`}
                        >
                            <div>{item.id}</div>
                            <div>{item.name}</div>
                            <div>{item.category}</div>
                            <div>{item.price}</div>
                            <div>{item.stock}</div>
                            <div className="font-semibold text-green-600">
                                {item.sales}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BestSellerSection;
