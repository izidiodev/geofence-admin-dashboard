export interface ToasterLike {
  create: (opts: {
    title?: string;
    description?: string;
    type?: "success" | "error";
    duration?: number;
  }) => string;
}

let toasterInstance: ToasterLike | null = null;

export function setToaster(toaster: ToasterLike | null): void {
  toasterInstance = toaster;
}

export function getToaster(): ToasterLike | null {
  return toasterInstance;
}
