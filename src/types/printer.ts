// types/printer.ts
export interface PrinterData {
    id: number;
    nm_printer: string;
    status: boolean;
}

export interface PrinterPaginationData {
    docs: PrinterData[];
    totalDocs: number;
    page: number;
    totalPages: number;
}

export interface PrinterApiResponse {
    message: string;
    data: PrinterPaginationData;
}

export interface PrinterInternalResponse {
    success: boolean;
    message: string;
    data?: PrinterPaginationData;
    errors?: any;
}
