import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BaseApiResponse } from "@/types/api";

export class ApiError extends Error {
  constructor(public status: number, message: string, public errors?: Record<string, string[]>) {
    super(message);
  }
}

export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit & { authToken?: string }
) {
  const { authToken, ...fetchOptions } = options;
  
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(authToken && {
      Authorization: authToken.startsWith("Bearer ") ? authToken : `Bearer ${authToken}`
    }),
    ...fetchOptions.headers,
  };

  const API_BASE_URL = "https://api-pos.masivaguna.com/api";
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || "API request failed", data.errors);
  }

  return { response, data };
}

export function getAuthToken(request: NextRequest): string | null {
  const cookieStore = cookies();
  return cookieStore.get("auth-token")?.value || request.headers.get("authorization");
}

// Helper function to create paginated GET endpoints
export function createPaginatedGetHandler(
  endpoint: string,
  options?: {
    validateResponse?: (data: BaseApiResponse) => boolean;
    defaultParams?: Record<string, string>;
  }
) {
  return async function handler(request: NextRequest): Promise<NextResponse> {
    const authToken = getAuthToken(request);

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required. Please login first." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = new URLSearchParams({
      offset: searchParams.get("offset") || "0",
      limit: searchParams.get("limit") || "100",
      ...options?.defaultParams,
    });

    // Add optional params if they exist
    const optionalParams = ["search", "sort_by", "sort_order"];
    optionalParams.forEach(param => {
      const value = searchParams.get(param);
      if (value) queryParams.append(param, value);
    });



    const { data: responseData } = await authenticatedFetch(
      `${endpoint}?${queryParams.toString()}`,
      { authToken, next: { revalidate: 300 } }
    );

    if (options?.validateResponse && !options.validateResponse(responseData)) {
      return NextResponse.json(
        { success: false, message: responseData.message || "Invalid response format" },
        { status: 400 }
      );
    }

    if (!responseData.data) {
      return NextResponse.json(
        { success: false, message: responseData.message || "No data returned" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${endpoint.replace('/', '')} data retrieved successfully`,
      data: responseData.data,
    });
  };
}

// Helper function to create simple GET endpoints  
export function createGetHandler(endpoint: string) {
  return async function handler(request: NextRequest): Promise<NextResponse> {
    const authToken = getAuthToken(request);

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required. Please login first." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

    const { data: responseData } = await authenticatedFetch(fullEndpoint, {
      authToken,
      next: { revalidate: 0 }
    });

    return NextResponse.json({
      success: true,
      message: responseData.message || `${endpoint.replace('/', '')} retrieved successfully`,
      data: responseData.data,
    });
  };
}

// Helper function to create POST endpoints
export function createPostHandler(endpoint: string) {
  return async function handler(request: NextRequest): Promise<NextResponse> {
    const authToken = getAuthToken(request);

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required. Please login first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { data: responseData } = await authenticatedFetch(endpoint, {
      method: "POST",
      authToken,
      body: JSON.stringify(body),
    });

    return NextResponse.json({
      success: true,
      message: `${endpoint.replace('/', '')} created successfully`,
      data: responseData.data,
    });
  };
}

// Helper function to create dynamic GET endpoints with path parameters
export function createDynamicGetHandler(
  endpointTemplate: string,
  options?: {
    transformResponse?: (data: unknown) => unknown;
    validateParams?: (params: Record<string, string>) => boolean;
    paramValidationMessage?: string;
  }
) {
  return async function handler(request: NextRequest, params?: Record<string, string>): Promise<NextResponse> {
    const authToken = getAuthToken(request);

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required. Please login first." },
        { status: 401 }
      );
    }

    if (!params || (options?.validateParams && !options.validateParams(params))) {
      return NextResponse.json(
        { success: false, message: options?.paramValidationMessage || "Invalid parameters" },
        { status: 400 }
      );
    }

    // Replace path parameters in endpoint template
    let endpoint = endpointTemplate;
    Object.entries(params).forEach(([key, value]) => {
      endpoint = endpoint.replace(`[${key}]`, value);
    });

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

    const { data: responseData } = await authenticatedFetch(fullEndpoint, {
      authToken,
      next: { revalidate: 0 }
    });

    let finalData = responseData.data;
    if (options?.transformResponse && finalData) {
      finalData = options.transformResponse(finalData);
    }

    return NextResponse.json({
      success: true,
      message: responseData.message || `${endpoint.replace('/', '')} retrieved successfully`,
      data: finalData,
    });
  };
}

// Helper function to create dynamic POST endpoints with path parameters
export function createDynamicPostHandler(
  endpointTemplate: string,
  options?: {
    validateParams?: (params: Record<string, string>) => boolean;
    paramValidationMessage?: string;
    validateBody?: (body: unknown) => boolean;
    bodyValidationMessage?: string;
    transformBody?: (body: unknown) => unknown;
  }
) {
  return async function handler(request: NextRequest, params?: Record<string, string>): Promise<NextResponse> {
    const authToken = getAuthToken(request);

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required. Please login first." },
        { status: 401 }
      );
    }

    if (!params || (options?.validateParams && !options.validateParams(params))) {
      return NextResponse.json(
        { success: false, message: options?.paramValidationMessage || "Invalid parameters" },
        { status: 400 }
      );
    }

    // Replace path parameters in endpoint template
    let endpoint = endpointTemplate;
    Object.entries(params).forEach(([key, value]) => {
      endpoint = endpoint.replace(`[${key}]`, value);
    });

    let body: unknown = null;
    
    try {
      body = await request.json();
    } catch {
      // No body provided - that's okay for some POST requests
      body = {};
    }
    
    if (options?.validateBody && !options.validateBody(body)) {
      return NextResponse.json(
        { success: false, message: options?.bodyValidationMessage || "Invalid request body" },
        { status: 400 }
      );
    }

    if (options?.transformBody) {
      body = options.transformBody(body);
    }

    const { data: responseData } = await authenticatedFetch(endpoint, {
      method: "POST",
      authToken,
      body: JSON.stringify(body),
    });

    return NextResponse.json({
      success: true,
      message: responseData.message || `${endpoint.replace('/', '')} created successfully`,
      data: responseData.data,
    });
  };
}

// Helper function to create dynamic PATCH endpoints with path parameters
export function createDynamicPatchHandler(
  endpointTemplate: string,
  options?: {
    validateParams?: (params: Record<string, string>) => boolean;
    paramValidationMessage?: string;
    validateBody?: (body: unknown) => boolean;
    bodyValidationMessage?: string;
    transformBody?: (body: unknown) => unknown;
  }
) {
  return async function handler(request: NextRequest, params?: Record<string, string>): Promise<NextResponse> {
    const authToken = getAuthToken(request);

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required. Please login first." },
        { status: 401 }
      );
    }

    if (!params || (options?.validateParams && !options.validateParams(params))) {
      return NextResponse.json(
        { success: false, message: options?.paramValidationMessage || "Invalid parameters" },
        { status: 400 }
      );
    }

    // Replace path parameters in endpoint template
    let endpoint = endpointTemplate;
    Object.entries(params).forEach(([key, value]) => {
      endpoint = endpoint.replace(`[${key}]`, value);
    });

    let body: unknown = null;
    
    try {
      body = await request.json();
    } catch {
      // No body provided - that's okay for some PATCH requests
      body = {};
    }
    
    if (options?.validateBody && !options.validateBody(body)) {
      return NextResponse.json(
        { success: false, message: options?.bodyValidationMessage || "Invalid request body" },
        { status: 400 }
      );
    }

    if (options?.transformBody) {
      body = options.transformBody(body);
    }

    const { data: responseData } = await authenticatedFetch(endpoint, {
      method: "PATCH",
      authToken,
      body: JSON.stringify(body),
    });

    return NextResponse.json({
      success: true,
      message: responseData.message || `${endpoint.replace('/', '')} updated successfully`,
      data: responseData.data,
    });
  };
}

export function createApiHandler(
  handlers: {
    GET?: (request: NextRequest, params?: Record<string, string>) => Promise<NextResponse>;
    POST?: (request: NextRequest, params?: Record<string, string>) => Promise<NextResponse>;
    PUT?: (request: NextRequest, params?: Record<string, string>) => Promise<NextResponse>;
    PATCH?: (request: NextRequest, params?: Record<string, string>) => Promise<NextResponse>;
    DELETE?: (request: NextRequest, params?: Record<string, string>) => Promise<NextResponse>;
  }
) {
  return async function handler(request: NextRequest, context?: { params?: Record<string, string> }) {
    try {
      const method = request.method as keyof typeof handlers;
      const handler = handlers[method];
      
      if (!handler) {
        return NextResponse.json(
          { success: false, message: `Method ${method} not allowed` },
          { status: 405 }
        );
      }

      return await handler(request, context?.params);
    } catch (error) {
      console.error(`❌ API ${request.method} error:`, error);

      if (error instanceof ApiError) {
        if (error.status === 401) {
          return NextResponse.json(
            { success: false, message: "Session expired. Please login again." },
            { status: 401 }
          );
        }
        return NextResponse.json(
          { success: false, message: error.message, errors: error.errors },
          { status: error.status }
        );
      }

      if (error instanceof TypeError && error.message.includes("fetch")) {
        return NextResponse.json(
          { success: false, message: "Unable to connect to API server" },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { success: false, message: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  };
}