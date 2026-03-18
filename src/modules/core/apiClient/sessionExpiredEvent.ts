export const SESSION_EXPIRED_EVENT = "geofence_admin_session_expired";

/** Disparado após logout manual (mesma aba); useAuth escuta para atualizar estado. */
export const AUTH_LOGOUT_EVENT = "geofence_admin_auth_logout";

export function dispatchSessionExpired(): void {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}

export function dispatchAuthLogout(): void {
  window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
}
