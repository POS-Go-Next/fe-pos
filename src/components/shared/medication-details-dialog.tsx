// components/shared/medication-details-dialog.tsx
"use client";

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MedicationDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productImage?: string;
}

const MedicationDetailsDialog: React.FC<MedicationDetailsDialogProps> = ({
  isOpen,
  onClose,
  productName = "Jamu Tolak Angin + Madu",
  productImage = "/api/placeholder/400/300"
}) => {
  if (!isOpen) return null;

  const medicationData = {
    description: "TOLAK ANGIN CAIR PLUS MADU 15 ML merupakan obat herbal terstandar yang mengandung kombinasi berbagai herbal alami yang dapat digunakan untuk meringankan gejala masuk angin. Selain itu, tolak angin cair juga dapat membantu meningkatkan daya tahan tubuh.",
    sku: "078290",
    productName: "Jamu Tolak Angin + Madu",
    packaging: "Dus, 12 Sachet @ 15 ml",
    segmentation: "Green",
    category: "OTC",
    department: "Herbal Drink",
    measurement: "-",
    prescription: "Tidak",
    manufacturer: "Sekawan Kosmetik Nusantara",
    dosage: {
      dosis: "Dewasa dan anak di atas 12 tahun: 1-2 tablet/kaplet, 3-4 kali per hari. Anak 6-12 tahun: ½-1 tablet/kaplet, 3-4 kali per hari.",
      usage: "Gunakan sesuai aturan penggunaan obat yang tertera pada kemasan atau anjuran dokter. Telan kapsul dengan bantuan air putih. Dikonsumsi sebelum atau sesudah makan."
    },
    indications: "Mengurangi demam. Mengurangi rasa sakit ringan hingga sedang, seperti sakit kepala, gigi, dan nyeri otot.",
    composition: "Bioactive fraction DLBS3233, Ekstrak Lagerstroemia speciosa 100 mg, Ekstrak Cinnamomum burma 100 mg.",
    warnings: "Konsumsi melebihi dosis menyebabkan ketusakan hati, bisa sangat serius sampai memerlukan transplantasi hati atau menyebabkan kematian. Bertahu dokter jika Anda memiliki riwayat penyakit hati dan gangguan ginjal.",
    contradiction: "Dilarang untuk ibu hamil & balita",
    sideEffects: "Belum ada efek samping yang dilaporkan. Jika kamu mengalami alergi, segera hentikan penggunaan obat dan hubungi dokter."
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Medication Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Main Content - Grid 2 kolom */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Product Image Section */}
              <div className="rounded-lg border border-gray-200">
                <div className="bg-blue-100 rounded-t-lg px-4 py-3">
                  <h3 className="text-blue-600 font-medium text-center">Product Image</h3>
                </div>
                <div className="bg-white rounded-b-lg p-4">
                  <div className="relative bg-gray-100 rounded-lg p-4 border-2 border-blue-400">
                    <img 
                      src="/api/placeholder/300/200" 
                      alt={productName}
                      className="w-full h-48 object-contain rounded"
                    />
                    <button className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="rounded-lg border border-gray-200">
                <div className="bg-blue-100 rounded-t-lg px-4 py-3">
                  <h3 className="text-blue-600 font-medium text-center">Description</h3>
                </div>
                <div className="bg-white rounded-b-lg p-4">
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {medicationData.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="text-gray-600 w-32">SKU</span>
                      <span className="text-gray-600 mx-2">:</span>
                      <span className="text-gray-900">{medicationData.sku}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-32">Product Name</span>
                      <span className="text-gray-600 mx-2">:</span>
                      <span className="text-gray-900">{medicationData.productName}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-32">Packaging</span>
                      <span className="text-gray-600 mx-2">:</span>
                      <span className="text-gray-900">{medicationData.packaging}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-32">Segmentation</span>
                      <span className="text-gray-600 mx-2">:</span>
                      <span className="text-gray-900">{medicationData.segmentation}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-32">Category</span>
                      <span className="text-gray-600 mx-2">:</span>
                      <span className="text-gray-900">{medicationData.category}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-32">Departemen</span>
                      <span className="text-gray-600 mx-2">:</span>
                      <span className="text-gray-900">{medicationData.department}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-32">Measurement</span>
                      <span className="text-gray-600 mx-2">:</span>
                      <span className="text-gray-900">{medicationData.measurement}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-32">Prescription (Resep)</span>
                      <span className="text-gray-600 mx-2">:</span>
                      <span className="text-gray-900">{medicationData.prescription}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-32">Manufacturer</span>
                      <span className="text-gray-600 mx-2">:</span>
                      <span className="text-gray-900">{medicationData.manufacturer}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Dosage & Usage Instructions Section */}
              <div className="rounded-lg border border-gray-200">
                <div className="bg-blue-100 rounded-t-lg px-4 py-3">
                  <h3 className="text-blue-600 font-medium text-center">Dosage & Usage Instructions</h3>
                </div>
                <div className="bg-white rounded-b-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-gray-800 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs">💊</span>
                        </div>
                        <span className="font-medium text-gray-900">Dosage (Dosis)</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {medicationData.dosage.dosis}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-gray-800 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs">📋</span>
                        </div>
                        <span className="font-medium text-gray-900">Usage Instructions (Aturan Pakai)</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {medicationData.dosage.usage}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Indications, Composition & Warnings Section */}
              <div className="rounded-lg border border-gray-200">
                <div className="bg-blue-100 rounded-t-lg px-4 py-3">
                  <h3 className="text-blue-600 font-medium text-center">Indications, Composition & Warnings</h3>
                </div>
                <div className="bg-white rounded-b-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-gray-800 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs">🎯</span>
                        </div>
                        <span className="font-medium text-gray-900">Indications</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {medicationData.indications}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-gray-800 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs">🧪</span>
                        </div>
                        <span className="font-medium text-gray-900">Composition</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {medicationData.composition}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-gray-800 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs">⚠️</span>
                        </div>
                        <span className="font-medium text-gray-900">Warnings</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {medicationData.warnings}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contradiction & Side Effects Section */}
              <div className="rounded-lg border border-gray-200">
                <div className="bg-blue-100 rounded-t-lg px-4 py-3">
                  <h3 className="text-blue-600 font-medium text-center">Contradiction & Side Effects</h3>
                </div>
                <div className="bg-white rounded-b-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-gray-800 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs">🚫</span>
                        </div>
                        <span className="font-medium text-gray-900">Contradiction</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {medicationData.contradiction}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-gray-800 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs">⚡</span>
                        </div>
                        <span className="font-medium text-gray-900">Side Effects</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {medicationData.sideEffects}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationDetailsDialog;