import { ApiError } from "./api-utils";

export function handleApiError(error: unknown): { message: string; status?: number } {
  if (error instanceof ApiError) {
    return { message: error.message, status: error.status };
  }
  
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return { message: "Network error. Please check your connection.", status: 503 };
  }
  
  if (error instanceof Error) {
    return { message: error.message };
  }
  
  return { message: "An unexpected error occurred" };
}

export function logError(context: string, error: unknown, additionalData?: unknown) {
  console.error(`❌ ${context}:`, error);
  if (additionalData) {
    console.error("Additional context:", additionalData);
  }
}