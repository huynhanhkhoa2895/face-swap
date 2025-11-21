import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "@/lib/types/api.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        const apiError: ApiError = {
          statusCode: error.response?.status || 500,
          message: error.response?.data?.message || "An error occurred",
          error: error.response?.data?.error || "Internal Server Error",
        };
        return Promise.reject(apiError);
      }
    );
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().getClient();
