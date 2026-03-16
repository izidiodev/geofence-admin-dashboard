export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface LoginResponseData {
  user: User;
  token: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
