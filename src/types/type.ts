import type { PaginatedResponse } from "@/types/api";

export interface Type {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type PaginatedTypeResponse = PaginatedResponse<Type>;
