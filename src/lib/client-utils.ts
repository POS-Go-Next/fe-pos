import type { CustomerData } from "@/types/customer";
import type { DoctorData } from "@/types/doctor";

// Client-side utilities
export async function clientFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expired. Please login again.");
    }
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return { response, data };
}

/**
 * Fetch a single customer by ID by searching through the customer list
 * Falls back to fetching the full list if needed
 */
export async function fetchCustomerById(customerId: number): Promise<CustomerData | null> {
  try {
    // Try fetching from list with high limit to ensure we get the customer
    const { data } = await clientFetch(
      `/api/customer?offset=0&limit=1000`,
      { method: "GET" }
    );

    if (data.success && data.data?.docs) {
      const customer = data.data.docs.find((c: CustomerData) => c.kd_cust === customerId);
      return customer || null;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching customer ${customerId}:`, error);
    return null;
  }
}

/**
 * Fetch a single doctor by ID by searching through the doctor list
 * Falls back to fetching the full list if needed
 */
export async function fetchDoctorById(doctorId: number): Promise<DoctorData | null> {
  try {
    // Try fetching from list with high limit to ensure we get the doctor
    const { data } = await clientFetch(
      `/api/doctor?offset=0&limit=1000`,
      { method: "GET" }
    );

    if (data.success && data.data?.docs) {
      const doctor = data.data.docs.find((d: DoctorData) => d.id === doctorId);
      return doctor || null;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching doctor ${doctorId}:`, error);
    return null;
  }
}