import { useMemo } from "react";
import { localStorageController } from "@modules/core";
import type { User } from "@/types/auth";

export function useAuth(): { isAuthenticated: boolean; user: User | null } {
  const user = useMemo(() => {
    return localStorageController.getItemParsed<User>(localStorageController.getUserKey());
  }, []);

  const token = useMemo(() => localStorageController.getToken(), []);

  const isAuthenticated = Boolean(token && user);

  return { isAuthenticated, user: isAuthenticated ? user : null };
}
