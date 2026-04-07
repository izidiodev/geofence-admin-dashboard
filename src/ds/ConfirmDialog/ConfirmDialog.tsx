import {
  Button,
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: "danger" | "default";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
  variant = "default",
}: ConfirmDialogProps): ReactNode {
  const handleConfirm = async (): Promise<void> => {
    try {
      await onConfirm();
    } catch {
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={(e) => (!e.open ? onClose() : undefined)}>
      <DialogPositioner>
        <DialogBackdrop />
        <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        {description ? <DialogBody>{description}</DialogBody> : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} minW="120px" gap={2}>
            {cancelLabel}
          </Button>
          <Button
            colorPalette={variant === "danger" ? "red" : "blue"}
            onClick={handleConfirm}
            loading={isLoading}
            minW="140px"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
