// app/dashboard/_components/ParameterReceiptPreview.tsx
"use client";

import { FC } from "react";

interface ParameterFormData {
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

interface ParameterReceiptPreviewProps {
    formData: ParameterFormData;
}

const ParameterReceiptPreview: FC<ParameterReceiptPreviewProps> = ({
    formData,
}) => {
    return (
        <div className="bg-white rounded-lg p-6 shadow-lg">
            {/* Receipt Content */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm">
                {/* Header */}
                <div className="text-center mb-4 border-b pb-4">
                    <div className="font-bold">{formData.header1}</div>
                    <div>{formData.header2}</div>
                    <div>{formData.header3}</div>
                    <div>{formData.header4}</div>
                    <div>{formData.header5}</div>
                </div>

                {/* Transaction Details */}
                <div className="mb-4">
                    <div className="font-bold mb-2">Transaction Details</div>

                    <div className="flex justify-between">
                        <span>Panadol 500mg CPL</span>
                        <span>1x</span>
                    </div>
                    <div className="text-right mb-2">Rp 12.000</div>

                    <div className="flex justify-between">
                        <span>Kurukumes Syrup 60ml</span>
                        <span>2x</span>
                    </div>
                    <div className="text-right mb-4">Rp 33.300</div>

                    <div className="border-t pt-2">
                        <div className="flex justify-between">
                            <span>Sub Total</span>
                            <span>Rp 520.100</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Misc</span>
                            <span>Rp 0</span>
                        </div>
                        <div className="flex justify-between">
                            <span>SC</span>
                            <span>Rp 0</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount</span>
                            <span>Rp 0</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Promo</span>
                            <span>Rp 0</span>
                        </div>
                    </div>
                </div>

                {/* Grand Total */}
                <div className="border-t border-b py-2 mb-4">
                    <div className="flex justify-between font-bold">
                        <span>Grand Total</span>
                        <span>Rp 520.100</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs space-y-1">
                    <div>eskp.system-apotekroxy.com</div>
                    <div>http://katalog.apotekroxy.com</div>
                    <div>Tersedia Dokter Konsultasi Gratis</div>
                    <div>Terimakasih Semoga Lekas Sembuh</div>
                </div>
            </div>
        </div>
    );
};

export default ParameterReceiptPreview;
