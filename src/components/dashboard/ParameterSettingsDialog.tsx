// components/dashboard/ParameterSettingsDialog.tsx - COMPLETE FIXED VERSION
"use client";

import { FC, useState, useEffect } from "react";
import { X, Loader2, AlertCircle, Receipt, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { useCabang } from "@/hooks/useCabang";
import { useArea } from "@/hooks/useArea";
import { useParameter } from "@/hooks/useParameter";
import { showSuccessAlert, showErrorAlert } from "@/lib/swal";

interface ParameterSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ParameterFormData) => void;
}

interface ParameterFormData {
  namaCabang: string;
  namaCabangText?: string;
  namaArea: string;
  namaAreaText?: string;
  lokasiDepo: string;
  lokasiSatelit: string;
  cabangBaru: string;
  rsia: string;
  barangTransit: string;
  sc: string;
  scDoctor: string;
  ruResep: string;
  ruSwalayan: string;
  shift1Start: string;
  shift1End: string;
  shift2Start: string;
  shift2End: string;
  shift3Start: string;
  shift3End: string;
  toleransiWaktuMin: string;
  toleransiWaktuMax: string;
  receiptType: 'header' | 'footer';
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

const ParameterSettingsDialog: FC<ParameterSettingsDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { parameterData, isLoading: isLoadingParameter, error: parameterError, refetch: refetchParameter, updateParameter } = useParameter();
  const { cabangList, isLoading: isLoadingCabang, error: cabangError, refetch: refetchCabang } = useCabang({
    limit: 50,
    offset: 0,
  });
  const { areaList, isLoading: isLoadingArea, error: areaError, refetch: refetchArea } = useArea({
    limit: 50,
    offset: 0,
  });

  const cabangOptions = cabangList.map((cabang) => ({
    value: cabang.kd_cabang,
    label: cabang.nama_cabang,
  }));

  const areaOptions = areaList.map((area) => ({
    value: area.id_area,
    label: area.nama_area,
  }));

  const [formData, setFormData] = useState<ParameterFormData>({
    namaCabang: "",
    namaArea: "",
    lokasiDepo: "",
    lokasiSatelit: "",
    cabangBaru: "Tidak",
    rsia: "Tidak",
    barangTransit: "Tidak",
    sc: "0",
    scDoctor: "0",
    ruResep: "0",
    ruSwalayan: "0",
    shift1Start: "07:00:00",
    shift1End: "14:29:00",
    shift2Start: "14:30:00",
    shift2End: "21:59:00",
    shift3Start: "22:00:00",
    shift3End: "07:00:00",
    toleransiWaktuMin: "30",
    toleransiWaktuMax: "120",
    receiptType: 'header',
    header1: "APOTEK ROXY",
    header2: "Jl. Blak NO.39 (BUKA 24 JAM)",
    header3: "TELP(021) 6318066 - WA. 08111002021",
    header4: "www.apotekroxy.com",
    header5: "Email - outlet001@apotekroxy.com",
    footer1: "",
    footer2: "",
    footer3: "",
    footer4: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const convertYNToYaTidak = (value: 'Y' | 'N'): string => {
    return value === 'Y' ? 'Ya' : 'Tidak';
  };

  const convertYaTidakToYN = (value: string): 'Y' | 'N' => {
    return value === 'Ya' ? 'Y' : 'N';
  };

  // FIXED: Enhanced useEffect with proper dependencies and debugging
  useEffect(() => {
    if (parameterData && cabangList.length > 0 && areaList.length > 0) {
      const selectedCabang = cabangList.find(cabang => cabang.kd_cabang === parameterData.kd_cab);
      const selectedArea = areaList.find(area => area.id_area === parameterData.kd_area);

      console.log('🔄 LOADING PARAMETER DATA INTO FORM');
      console.log('📋 Parameter Data:', {
        kd_area: parameterData.kd_area,
        kd_cab: parameterData.kd_cab,
        kd_depo: parameterData.kd_depo,
        kd_satelit: parameterData.kd_satelit,
        timestamp: new Date().toISOString()
      });
      console.log('📋 Found Cabang:', selectedCabang);
      console.log('📋 Found Area:', selectedArea);
      console.log('📋 Available Areas:', areaList.map(a => ({ id: a.id_area, name: a.nama_area })));

      setFormData(prev => {
        const newFormData = {
          ...prev,
          namaCabang: parameterData.kd_cab || "",
          namaCabangText: selectedCabang?.nama_cabang || '',
          namaArea: parameterData.kd_area || "",
          namaAreaText: selectedArea?.nama_area || '',
          lokasiDepo: parameterData.kd_depo || "",
          lokasiSatelit: parameterData.kd_satelit || "",
          cabangBaru: convertYNToYaTidak(parameterData.cabang_baru || 'N'),
          rsia: convertYNToYaTidak(parameterData.rsia || 'N'),
          barangTransit: convertYNToYaTidak(parameterData.transit || 'N'),
          sc: (parameterData.service || 0).toString(),
          scDoctor: (parameterData.service_dokter || 0).toString(),
          ruResep: (parameterData.roundup_resep || 0).toString(),
          ruSwalayan: (parameterData.roundup_swalayan || 0).toString(),
          shift1Start: parameterData.shift_1_awal || "07:00:00",
          shift1End: parameterData.shift_1_akhir || "14:29:00",
          shift2Start: parameterData.shift_2_awal || "14:30:00",
          shift2End: parameterData.shift_2_akhir || "21:59:00",
          shift3Start: parameterData.shift_3_awal || "22:00:00",
          shift3End: parameterData.shift_3_akhir || "07:00:00",
          toleransiWaktuMin: (parameterData.toleransi_awal || 30).toString(),
          toleransiWaktuMax: (parameterData.toleransi_akhir || 120).toString(),
          receiptType: 'header' as const,
          header1: parameterData.header_struk_line1 || "",
          header2: parameterData.header_struk_line2 || "",
          header3: parameterData.header_struk_line3 || "",
          header4: parameterData.header_struk_line4 || "",
          header5: parameterData.header_struk_line5 || "",
          footer1: parameterData.footer_struk_line1 || "",
          footer2: parameterData.footer_struk_line2 || "",
          footer3: parameterData.footer_struk_line3 || "",
          footer4: parameterData.footer_struk_line4 || "",
        };

        console.log('✅ Form data updated:', {
          namaCabang: newFormData.namaCabang,
          namaArea: newFormData.namaArea,
          namaCabangText: newFormData.namaCabangText,
          namaAreaText: newFormData.namaAreaText,
        });

        return newFormData;
      });
    }
  }, [parameterData, cabangList, areaList]); // FIXED: Added proper dependencies

  if (!isOpen) return null;

  const handleInputChange = (field: keyof ParameterFormData, value: string) => {
    console.log(`🔄 Input changed: ${field} = ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCabangChange = (kdCabang: string) => {
    console.log('🔄 CABANG CHANGE');
    console.log('📝 Selected kdCabang:', kdCabang);
    
    const selectedCabang = cabangList.find(cabang => cabang.kd_cabang === kdCabang);
    console.log('📝 Found cabang:', selectedCabang);
    
    setFormData(prev => ({
      ...prev,
      namaCabang: kdCabang,
      namaCabangText: selectedCabang?.nama_cabang || ''
    }));
  };

  const handleAreaChange = (idArea: string) => {
    console.log('🔄 AREA CHANGE');
    console.log('📝 Selected idArea:', idArea);
    console.log('📝 Available areaList:', areaList);
    
    const selectedArea = areaList.find(area => area.id_area === idArea);
    console.log('📝 Found area:', selectedArea);
    
    setFormData(prev => {
      const newFormData = {
        ...prev,
        namaArea: idArea,
        namaAreaText: selectedArea?.nama_area || ''
      };
      
      console.log('📝 Form data after area change:', {
        namaArea: newFormData.namaArea,
        namaAreaText: newFormData.namaAreaText
      });
      
      return newFormData;
    });
  };

  // FIXED: Enhanced handleSubmit with better error handling and debugging
  const handleSubmit = async () => {
    const requiredFields = {
      namaCabang: 'Nama Cabang',
      namaArea: 'Nama Area'
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field as keyof ParameterFormData]) {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      await showErrorAlert(
        'Validation Error',
        `Please select: ${missingFields.join(', ')}`,
        'OK'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 FORM SUBMISSION STARTED');
      console.log('📋 Current Form Data:', {
        namaCabang: formData.namaCabang,
        namaArea: formData.namaArea,
        namaCabangText: formData.namaCabangText,
        namaAreaText: formData.namaAreaText,
        timestamp: new Date().toISOString()
      });
      console.log('📋 Current Parameter Data:', {
        kd_cab: parameterData?.kd_cab,
        kd_area: parameterData?.kd_area,
        timestamp: new Date().toISOString()
      });

      const updateData = {
        kd_cab: formData.namaCabang,
        kd_area: formData.namaArea,
        kd_depo: formData.lokasiDepo,
        kd_satelit: formData.lokasiSatelit,
        cabang_baru: convertYaTidakToYN(formData.cabangBaru),
        rsia: convertYaTidakToYN(formData.rsia),
        transit: convertYaTidakToYN(formData.barangTransit),
        service: parseInt(formData.sc) || 0,
        service_dokter: parseInt(formData.scDoctor) || 0,
        roundup_resep: parseInt(formData.ruResep) || 0,
        roundup_swalayan: parseInt(formData.ruSwalayan) || 0,
        shift_1_awal: formData.shift1Start,
        shift_1_akhir: formData.shift1End,
        shift_2_awal: formData.shift2Start,
        shift_2_akhir: formData.shift2End,
        shift_3_awal: formData.shift3Start,
        shift_3_akhir: formData.shift3End,
        toleransi_awal: parseInt(formData.toleransiWaktuMin) || 30,
        toleransi_akhir: parseInt(formData.toleransiWaktuMax) || 120,
        header_struk_line1: formData.header1,
        header_struk_line2: formData.header2,
        header_struk_line3: formData.header3,
        header_struk_line4: formData.header4,
        header_struk_line5: formData.header5,
        footer_struk_line1: formData.footer1,
        footer_struk_line2: formData.footer2,
        footer_struk_line3: formData.footer3,
        footer_struk_line4: formData.footer4,
        // FIXED: Preserve all existing parameter data that's not being updated
        kd_pt: parameterData?.kd_pt || "001",
        type_cab: parameterData?.type_cab || "1",
        trana: parameterData?.trana || 30,
        tranb: parameterData?.tranb || 60,
        intervala_fast: parameterData?.intervala_fast || 1000,
        intervala_midle: parameterData?.intervala_midle || 101,
        intervalb_midle: parameterData?.intervalb_midle || 1000,
        intervala_slow: parameterData?.intervala_slow || 1,
        intervalb_slow: parameterData?.intervalb_slow || 99,
        buffera_fast: parameterData?.buffera_fast || 8,
        bufferb_fast: parameterData?.bufferb_fast || 15,
        buffera_midle: parameterData?.buffera_midle || 3,
        bufferb_midle: parameterData?.bufferb_midle || 3,
        buffera_slow: parameterData?.buffera_slow || 1,
        bufferb_slow: parameterData?.bufferb_slow || 99,
        versi: parameterData?.versi || "0.0",
        migrasi: parameterData?.migrasi || "201708",
        drive: parameterData?.drive || "X",
        max_hari_retur: parameterData?.max_hari_retur || 3,
        aktif_f11: parameterData?.aktif_f11 || "N",
        footer_struk_line5: parameterData?.footer_struk_line5 || "",
        finger: parameterData?.finger || "Y",
        timer: parameterData?.timer || "00:00:25  ",
        transfer: parameterData?.transfer || "Y",
        ethical: parameterData?.ethical || "Y",
        otc: parameterData?.otc || "Y",
        huruf_berjalan: parameterData?.huruf_berjalan || "                              ''SILAKAN PILIH PUAS ATAU TIDAK PUAS TENTANG PELAYANAN KAMI''",
        timer_huruf: parameterData?.timer_huruf || 500,
        tranc: parameterData?.tranc || 90,
        trand: parameterData?.trand || 180,
        printer: parameterData?.printer || "L3110",
        grade: parameterData?.grade || "A",
        dokter_praktek: parameterData?.dokter_praktek || "Y",
        nomor_wa: parameterData?.nomor_wa || "08112729327/6287782122232",
        nama_olm: parameterData?.nama_olm || "SUGENG.H",
        pembelian_langsung: parameterData?.pembelian_langsung || "Y",
        awal_jam_promo: parameterData?.awal_jam_promo || "00:00:00",
        akhir_jam_promo: parameterData?.akhir_jam_promo || "00:00:00",
        stock_online: parameterData?.stock_online || "Y",
        bpjs: parameterData?.bpjs || "N",
        promo_cashback: parameterData?.promo_cashback || "N",
        po_tac: parameterData?.po_tac || "N",
        min_buffer: parameterData?.min_buffer || 7,
        max_buffer: parameterData?.max_buffer || 10,
        insert_po: parameterData?.insert_po || "N",
        edit_po: parameterData?.edit_po || "N",
        cabang_central: parameterData?.cabang_central || "N",
        min_buffer_central: parameterData?.min_buffer_central || 7,
        max_buffer_central: parameterData?.max_buffer_central || 10,
        cabang_penyangga: parameterData?.cabang_penyangga || "N",
      };

      console.log('📤 SENDING TO API');
      console.log('📤 Update Data Keys:', Object.keys(updateData));
      console.log('📤 Critical Fields:', {
        kd_cab: updateData.kd_cab,
        kd_area: updateData.kd_area,
        kd_depo: updateData.kd_depo,
        kd_satelit: updateData.kd_satelit,
        timestamp: new Date().toISOString()
      });
      
      const success = await updateParameter(updateData);
      
      if (success) {
        console.log('✅ UPDATE SUCCESS - Dialog will close after delay');
        await showSuccessAlert(
          'Success!',
          'Parameter settings updated successfully',
          1500
        );
        
        // FIXED: Wait longer for the data to propagate and close dialog properly
        setTimeout(async () => {
          console.log('🔄 Final refetch before closing dialog');
          await refetchParameter();
          onSubmit(formData);
          onClose();
        }, 2000); // FIXED: Increased delay to 2 seconds
      } else {
        console.log('❌ UPDATE FAILED');
        await showErrorAlert(
          'Update Failed',
          'Failed to update parameter settings. Please try again.',
          'OK'
        );
      }
    } catch (error) {
      console.error('❌ Error submitting parameter:', error);
      await showErrorAlert(
        'Error',
        'An unexpected error occurred. Please try again.',
        'OK'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewReceipt = () => {
    console.log("📄 View Receipt clicked");
    // TODO: Implement receipt preview functionality
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] relative z-10 flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-[#202325]">
            Parameter Setting
          </h2>
          <button onClick={onClose} disabled={isSubmitting}>
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {isLoadingParameter && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading parameter data...</span>
            </div>
          </div>
        )}

        {parameterError && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 mb-4">{parameterError}</p>
              <Button onClick={refetchParameter} variant="outline">
                Retry
              </Button>
            </div>
          </div>
        )}

        {!isLoadingParameter && !parameterError && (
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-2 gap-6 h-full">
              
              <div className="space-y-6">
                <div className="bg-white border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Cabang
                      </label>
                      <Combobox
                        options={cabangOptions}
                        value={formData.namaCabang}
                        onValueChange={handleCabangChange}
                        placeholder={
                          isLoadingCabang ? "Loading cabang..." : 
                          cabangError ? "Error loading data" : 
                          "Pilih Cabang"
                        }
                        searchPlaceholder="Cari cabang..."
                        emptyText="Cabang tidak ditemukan"
                        disabled={isLoadingCabang || isSubmitting}
                        loading={isLoadingCabang}
                        className="w-full"
                      />
                      {cabangError && (
                        <div className="mt-2 flex items-center gap-2">
                          <p className="text-red-500 text-xs flex-1">
                            Failed to load cabang data. Please try again.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={refetchCabang}
                            className="text-xs h-7 px-2"
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Area
                      </label>
                      <Combobox
                        options={areaOptions}
                        value={formData.namaArea}
                        onValueChange={handleAreaChange}
                        placeholder={
                          isLoadingArea ? "Loading area..." : 
                          areaError ? "Error loading data" : 
                          "Pilih Area"
                        }
                        searchPlaceholder="Cari area..."
                        emptyText="Area tidak ditemukan"
                        disabled={isLoadingArea || isSubmitting}
                        loading={isLoadingArea}
                        className="w-full"
                      />
                      {areaError && (
                        <div className="mt-2 flex items-center gap-2">
                          <p className="text-red-500 text-xs flex-1">
                            Failed to load area data. Please try again.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={refetchArea}
                            className="text-xs h-7 px-2"
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lokasi Depo
                      </label>
                      <Input
                        value={formData.lokasiDepo}
                        onChange={(e) => handleInputChange("lokasiDepo", e.target.value)}
                        className="bg-[#F5F5F5] border-none"
                        placeholder="Kode Depo"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lokasi Satelit
                      </label>
                      <Input
                        value={formData.lokasiSatelit}
                        onChange={(e) => handleInputChange("lokasiSatelit", e.target.value)}
                        className="bg-[#F5F5F5] border-none"
                        placeholder="Kode Satelit"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cabang Baru
                      </label>
                      <Select
                        value={formData.cabangBaru}
                        onValueChange={(value) => handleInputChange("cabangBaru", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="bg-[#F5F5F5] border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tidak">Tidak</SelectItem>
                          <SelectItem value="Ya">Ya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        RSIA
                      </label>
                      <Select
                        value={formData.rsia}
                        onValueChange={(value) => handleInputChange("rsia", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="bg-[#F5F5F5] border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tidak">Tidak</SelectItem>
                          <SelectItem value="Ya">Ya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Barang Transit
                      </label>
                      <Select
                        value={formData.barangTransit}
                        onValueChange={(value) => handleInputChange("barangTransit", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="bg-[#F5F5F5] border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tidak">Tidak</SelectItem>
                          <SelectItem value="Ya">Ya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SC
                      </label>
                      <Input
                        value={formData.sc}
                        onChange={(e) => handleInputChange("sc", e.target.value)}
                        className="bg-[#F5F5F5] border-none"
                        type="number"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SC Doctor
                      </label>
                      <Input
                        value={formData.scDoctor}
                        onChange={(e) => handleInputChange("scDoctor", e.target.value)}
                        className="bg-[#F5F5F5] border-none"
                        type="number"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        RU Resep
                      </label>
                      <Input
                        value={formData.ruResep}
                        onChange={(e) => handleInputChange("ruResep", e.target.value)}
                        className="bg-[#F5F5F5] border-none"
                        type="number"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        RU Swalayan
                      </label>
                      <Input
                        value={formData.ruSwalayan}
                        onChange={(e) => handleInputChange("ruSwalayan", e.target.value)}
                        className="bg-[#F5F5F5] border-none"
                        type="number"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shift 1
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={formData.shift1Start}
                          onChange={(e) => handleInputChange("shift1Start", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
                          disabled={isSubmitting}
                        />
                        <span>-</span>
                        <Input
                          type="time"
                          value={formData.shift1End}
                          onChange={(e) => handleInputChange("shift1End", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shift 2
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={formData.shift2Start}
                          onChange={(e) => handleInputChange("shift2Start", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
                          disabled={isSubmitting}
                        />
                        <span>-</span>
                        <Input
                          type="time"
                          value={formData.shift2End}
                          onChange={(e) => handleInputChange("shift2End", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shift 3
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={formData.shift3Start}
                          onChange={(e) => handleInputChange("shift3Start", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
                          disabled={isSubmitting}
                        />
                        <span>-</span>
                        <Input
                          type="time"
                          value={formData.shift3End}
                          onChange={(e) => handleInputChange("shift3End", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Toleransi Waktu (min)
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={formData.toleransiWaktuMin}
                          onChange={(e) => handleInputChange("toleransiWaktuMin", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
                          type="number"
                          disabled={isSubmitting}
                        />
                        <span>-</span>
                        <Input
                          value={formData.toleransiWaktuMax}
                          onChange={(e) => handleInputChange("toleransiWaktuMax", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
                          type="number"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4 h-fit">
                <div className="flex gap-4 mb-6">
                  <div
                    className={`flex-1 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      formData.receiptType === 'header'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !isSubmitting && handleInputChange('receiptType', 'header')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-white" />
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        formData.receiptType === 'header'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {formData.receiptType === 'header' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <span className={`text-sm font-medium block ${
                      formData.receiptType === 'header'
                        ? 'text-blue-600'
                        : 'text-gray-700'
                    }`}>
                      Header Receipt
                    </span>
                  </div>
                  
                  <div
                    className={`flex-1 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      formData.receiptType === 'footer'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !isSubmitting && handleInputChange('receiptType', 'footer')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        formData.receiptType === 'footer'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {formData.receiptType === 'footer' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <span className={`text-sm font-medium block ${
                      formData.receiptType === 'footer'
                        ? 'text-blue-600'
                        : 'text-gray-700'
                    }`}>
                      Footer Receipt
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {formData.receiptType === 'header' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Header 1
                        </label>
                        <Input
                          value={formData.header1}
                          onChange={(e) => handleInputChange("header1", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Header 2
                        </label>
                        <Input
                          value={formData.header2}
                          onChange={(e) => handleInputChange("header2", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Header 3
                        </label>
                        <Input
                          value={formData.header3}
                          onChange={(e) => handleInputChange("header3", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Header 4
                        </label>
                        <Input
                          value={formData.header4}
                          onChange={(e) => handleInputChange("header4", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Header 5
                        </label>
                        <Input
                          value={formData.header5}
                          onChange={(e) => handleInputChange("header5", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
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
                          onChange={(e) => handleInputChange("footer1", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Footer 2
                        </label>
                        <Input
                          value={formData.footer2}
                          onChange={(e) => handleInputChange("footer2", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Footer 3
                        </label>
                        <Input
                          value={formData.footer3}
                          onChange={(e) => handleInputChange("footer3", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Footer 4
                        </label>
                        <Input
                          value={formData.footer4}
                          onChange={(e) => handleInputChange("footer4", e.target.value)}
                          className="bg-[#F5F5F5] border-none"
                          disabled={isSubmitting}
                        />
                      </div>
                    </>
                  )}
                </div>

                <Button
                  onClick={handleViewReceipt}
                  className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
                  disabled={isSubmitting}
                >
                  View Receipt
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 p-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-8"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 px-8"
            disabled={isSubmitting || isLoadingParameter || !!parameterError}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ParameterSettingsDialog;