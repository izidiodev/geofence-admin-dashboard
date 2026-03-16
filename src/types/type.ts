export interface Type {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTypeResponse {
  items: Type[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
