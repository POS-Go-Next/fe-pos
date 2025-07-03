// app/create-order/choose-menu/_components/KeyboardShortcutGuide.tsx
"use client";

import React from 'react';
import { X } from 'lucide-react';

interface KeyboardShortcutGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutGuide: React.FC<KeyboardShortcutGuideProps> = ({ 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'F1', description: 'Petunjuk Penggunaan Shortcut' },
    { key: 'F2', description: 'Bayar/Hystorical Transaksi' },
    { key: 'F3', description: 'Discount (hanya untuk resep)' },
    { key: 'Alt + F3', description: 'Discount Global (hanya untuk resep)' },
    { key: 'F4', description: 'Batal/Void (Clear Form Transaksi)' },
    { key: 'F6', description: 'Up Selling' },
    { key: 'F7', description: 'Daftar Transaksi' },
    { key: 'F8', description: 'Koreksi Transaksi/Retur' },
    { key: 'F9', description: 'Tambah Bon Gantung' },
    { key: 'Alt + F9', description: 'Lihat Bon Gantung' },
    { key: 'F10', description: 'Member Corporate' },
    { key: 'F11', description: 'Usulan barang baru' },
    { key: 'F12', description: 'Tambah Misc' },
    { key: 'Alt + R', description: 'Retur PerBarang' },
    { key: 'Alt + T', description: 'Retur Semua Barang' },
  ];

  const rightColumnShortcuts = [
    { key: 'Alt + K', description: 'Menandakan Transaksi tidak biasa (Khusus). Contoh : Diborong, Tender, dll. Sehingga tidak masuk Perhitungan Permintaan Barang.' },
    { key: '. (Titik)', description: 'Tambahkan SC (Service) Hanya Resep' },
    { key: 'Alt + . (Alt + Titik)', description: 'Tambahkan SC (Service & Konsultasi)' },
    { key: '. . (Titik 2×)', description: 'RC (Racikan)' },
    { key: ', (Koma)', description: 'Delete SC (Hanya Resep)' },
    { key: '~ (Tilde)', description: 'Calculator (Tekan enter untuk pembulatan keatas, Tekan ~ lagi untuk masuk Qty)' },
    { key: '/ (Garis Miring)', description: 'Calculator Sederhana' },
    { key: ': (Titik Dua)', description: 'Setengah Resep' },
    { key: '; (Titik Koma)', description: 'Dua Kali Resep' },
    { key: 'Esc', description: 'Keluar' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcut Guide</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="space-y-1">
              {shortcuts.map((shortcut, index) => (
                <div 
                  key={index}
                  className="flex items-start py-2 border-b border-dotted border-gray-300 last:border-b-0"
                >
                  <div className="w-24 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {shortcut.key}
                    </span>
                  </div>
                  <div className="flex-1 ml-4">
                    <span className="text-sm text-gray-700">
                      {shortcut.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-1">
              {rightColumnShortcuts.map((shortcut, index) => (
                <div 
                  key={index}
                  className="flex items-start py-2 border-b border-dotted border-gray-300 last:border-b-0"
                >
                  <div className="w-32 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {shortcut.key}
                    </span>
                  </div>
                  <div className="flex-1 ml-4">
                    <span className="text-sm text-gray-700 leading-relaxed">
                      {shortcut.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutGuide;