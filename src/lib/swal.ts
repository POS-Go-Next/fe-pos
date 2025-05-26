// lib/swal.ts
import Swal from 'sweetalert2';

// Default styling untuk SweetAlert2
const defaultCustomClass = {
  popup: 'rounded-xl shadow-2xl',
  confirmButton: 'rounded-lg px-6 py-2 font-medium',
  cancelButton: 'rounded-lg px-6 py-2 font-medium',
  title: 'text-lg font-bold',
  htmlContainer: 'text-sm text-gray-600',
};

// Success alert
export const showSuccessAlert = (title: string, text?: string, timer: number = 2000) => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    timer,
    showConfirmButton: false,
    customClass: defaultCustomClass,
    background: '#ffffff',
    color: '#1f2937',
  });
};

// Error alert
export const showErrorAlert = (title: string, text?: string, confirmButtonText: string = 'OK') => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText,
    confirmButtonColor: '#dc2626',
    customClass: defaultCustomClass,
    background: '#ffffff',
    color: '#1f2937',
  });
};

// Warning alert
export const showWarningAlert = (title: string, text?: string, confirmButtonText: string = 'OK') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonText,
    confirmButtonColor: '#f59e0b',
    customClass: defaultCustomClass,
    background: '#ffffff',
    color: '#1f2937',
  });
};

// Confirmation alert
export const showConfirmAlert = (
  title: string, 
  text?: string,
  confirmButtonText: string = 'Yes',
  cancelButtonText: string = 'Cancel'
) => {
  return Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: '#025CCA',
    cancelButtonColor: '#6b7280',
    customClass: defaultCustomClass,
    background: '#ffffff',
    color: '#1f2937',
  });
};

// Loading alert
export const showLoadingAlert = (title: string = 'Please wait...', text?: string) => {
  return Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
    customClass: {
      ...defaultCustomClass,
      loader: 'border-blue-600',
    },
    background: '#ffffff',
    color: '#1f2937',
  });
};

// Toast notification
export const showToast = (icon: 'success' | 'error' | 'warning' | 'info', title: string) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
    customClass: {
      popup: 'rounded-lg shadow-lg',
    },
  });

  return Toast.fire({
    icon,
    title,
  });
};