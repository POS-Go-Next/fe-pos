"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Receipt, FileText } from "lucide-react";
import { FC } from "react";

interface ParameterFormData {
    receiptType: "header" | "footer";
    header1: string;
    header2: string;
    header3: string;
    header4: string;
    header5: string;
    footer1: string;
    footer2: string;
    footer3: string;
    footer4: string;
}

interface ParameterReceiptSectionProps {
    formData: ParameterFormData;
    isSubmitting: boolean;
    onInputChange: (field: keyof ParameterFormData, value: string) => void;
    onViewReceipt: () => void;
    showPreview?: boolean;
}

const ParameterReceiptSection: FC<ParameterReceiptSectionProps> = ({
    formData,
    isSubmitting,
    onInputChange,
    onViewReceipt,
    showPreview = false,
}) => {
    return (
        <div className="bg-white border rounded-lg p-4 h-fit">
            <div className="flex gap-4 mb-6">
                <div
                    className={`flex-1 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        formData.receiptType === "header"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() =>
                        !isSubmitting && onInputChange("receiptType", "header")
                    }
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-white" />
                        </div>
                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                formData.receiptType === "header"
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-gray-300 bg-white"
                            }`}
                        >
                            {formData.receiptType === "header" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                        </div>
                    </div>
                    <span
                        className={`text-sm font-medium block ${
                            formData.receiptType === "header"
                                ? "text-blue-600"
                                : "text-gray-700"
                        }`}
                    >
                        Header Receipt
                    </span>
                </div>

                <div
                    className={`flex-1 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        formData.receiptType === "footer"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() =>
                        !isSubmitting && onInputChange("receiptType", "footer")
                    }
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                formData.receiptType === "footer"
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-gray-300 bg-white"
                            }`}
                        >
                            {formData.receiptType === "footer" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                        </div>
                    </div>
                    <span
                        className={`text-sm font-medium block ${
                            formData.receiptType === "footer"
                                ? "text-blue-600"
                                : "text-gray-700"
                        }`}
                    >
                        Footer Receipt
                    </span>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                {formData.receiptType === "header" ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Header 1
                            </label>
                            <Input
                                value={formData.header1}
                                onChange={(e) =>
                                    onInputChange("header1", e.target.value)
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Header 2
                            </label>
                            <Input
                                value={formData.header2}
                                onChange={(e) =>
                                    onInputChange("header2", e.target.value)
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Header 3
                            </label>
                            <Input
                                value={formData.header3}
                                onChange={(e) =>
                                    onInputChange("header3", e.target.value)
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Header 4
                            </label>
                            <Input
                                value={formData.header4}
                                onChange={(e) =>
                                    onInputChange("header4", e.target.value)
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Header 5
                            </label>
                            <Input
                                value={formData.header5}
                                onChange={(e) =>
                                    onInputChange("header5", e.target.value)
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                disabled={isSubmitting}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Footer 1
                            </label>
                            <Input
                                value={formData.footer1}
                                onChange={(e) =>
                                    onInputChange("footer1", e.target.value)
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Footer 2
                            </label>
                            <Input
                                value={formData.footer2}
                                onChange={(e) =>
                                    onInputChange("footer2", e.target.value)
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Footer 3
                            </label>
                            <Input
                                value={formData.footer3}
                                onChange={(e) =>
                                    onInputChange("footer3", e.target.value)
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Footer 4
                            </label>
                            <Input
                                value={formData.footer4}
                                onChange={(e) =>
                                    onInputChange("footer4", e.target.value)
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                disabled={isSubmitting}
                            />
                        </div>
                    </>
                )}
            </div>

            <Button
                onClick={onViewReceipt}
                className="w-full bg-blue-600 hover:bg-blue-700 h-[44px]"
                disabled={isSubmitting}
            >
                {showPreview ? "Hide Receipt" : "View Receipt"}
            </Button>
        </div>
    );
};

export default ParameterReceiptSection;
