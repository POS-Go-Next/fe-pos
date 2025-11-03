/**
 * Customer and Doctor localStorage management utilities
 * These utilities handle persistent storage of customer and doctor data across transactions
 */

export interface StoredCustomerData {
  id: number;
  name: string;
  gender: string;
  age: string;
  phone: string;
  address: string;
  status: string;
}

export interface StoredDoctorData {
  id: number;
  fullname: string;
  phone: string;
  address: string;
  fee_consultation?: number;
  sip: string;
}

const CUSTOMER_STORAGE_KEY = "pos-selected-customer";
const DOCTOR_STORAGE_KEY = "pos-selected-doctor";

/**
 * Save customer data to localStorage
 */
export const saveCustomerToStorage = (customer: StoredCustomerData): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
  } catch (error) {
    console.error("Error saving customer to localStorage:", error);
  }
};

/**
 * Retrieve customer data from localStorage
 */
export const getCustomerFromStorage = (): StoredCustomerData | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error retrieving customer from localStorage:", error);
    return null;
  }
};

/**
 * Get customer ID from localStorage
 */
export const getCustomerIdFromStorage = (): number | null => {
  const customer = getCustomerFromStorage();
  return customer?.id ?? null;
};

/**
 * Clear customer data from localStorage
 */
export const clearCustomerFromStorage = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing customer from localStorage:", error);
  }
};

/**
 * Save doctor data to localStorage
 */
export const saveDoctorToStorage = (doctor: StoredDoctorData): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DOCTOR_STORAGE_KEY, JSON.stringify(doctor));
  } catch (error) {
    console.error("Error saving doctor to localStorage:", error);
  }
};

/**
 * Retrieve doctor data from localStorage
 */
export const getDoctorFromStorage = (): StoredDoctorData | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(DOCTOR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error retrieving doctor from localStorage:", error);
    return null;
  }
};

/**
 * Get doctor ID from localStorage
 */
export const getDoctorIdFromStorage = (): number | null => {
  const doctor = getDoctorFromStorage();
  return doctor?.id ?? null;
};

/**
 * Clear doctor data from localStorage
 */
export const clearDoctorFromStorage = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DOCTOR_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing doctor from localStorage:", error);
  }
};

/**
 * Clear both customer and doctor data from localStorage
 */
export const clearCustomerAndDoctorFromStorage = (): void => {
  clearCustomerFromStorage();
  clearDoctorFromStorage();
};
