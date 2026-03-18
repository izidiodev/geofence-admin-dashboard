import { useMemo, useState, useEffect } from "react";
import { localStorageController, AUTH_LOGOUT_EVENT } from "@modules/core";
import type { User } from "@/types/auth";

const USER_KEY = localStorageController.getUserKey();

export function useAuth(): { isAuthenticated: boolean; user: User | null } {
  const [storageVersion, setStorageVersion] = useState(0);

  const user = useMemo(() => {
    return localStorageController.getItemParsed<User>(USER_KEY);
  }, [storageVersion]);

  const token = useMemo(() => localStorageController.getToken(), [storageVersion]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent): void => {
      if (e.key === USER_KEY || e.key === localStorageController.getTokenKey()) {
        setStorageVersion((v) => v + 1);
      }
    };
    const handleLogout = (): void => setStorageVersion((v) => v + 1);
    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout);
    };
  }, []);

  const isAuthenticated = Boolean(token && user);

  return { isAuthenticated, user: isAuthenticated ? user : null };
}
