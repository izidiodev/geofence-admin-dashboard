const KEY_TOKEN = "geofence_admin_token";
const KEY_USER = "geofence_admin_user";

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // quota or disabled
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const localStorageController = {
  setItem(key: string, value: string): void {
    safeSetItem(key, value);
  },

  getItem(key: string): string | null {
    return safeGetItem(key);
  },

  getItemParsed<T>(key: string): T | null {
    const raw = safeGetItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  removeItem(key: string): void {
    safeRemoveItem(key);
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
  },

  getToken(): string | null {
    return safeGetItem(KEY_TOKEN);
  },

  setToken(token: string): void {
    safeSetItem(KEY_TOKEN, token);
  },

  removeToken(): void {
    safeRemoveItem(KEY_TOKEN);
  },

  getUserKey(): string {
    return KEY_USER;
  },

  getTokenKey(): string {
    return KEY_TOKEN;
  },
};
