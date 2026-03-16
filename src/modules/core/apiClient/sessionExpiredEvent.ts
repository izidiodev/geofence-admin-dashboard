export const SESSION_EXPIRED_EVENT = "geofence_admin_session_expired";

export function dispatchSessionExpired(): void {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}
