import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ConfirmDialog } from "./ConfirmDialog";

function wrap(ui: React.ReactElement) {
  return <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>;
}

describe("ConfirmDialog", () => {
  it("não chama onClose ao confirmar quando onConfirm rejeita (erro)", async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn().mockRejectedValue(new Error("Falha"));
    render(
      wrap(
        <ConfirmDialog
          open={true}
          onClose={onClose}
          onConfirm={onConfirm}
          title="Excluir?"
          confirmLabel="Excluir"
        />
      )
    );
    const confirmBtn = screen.getByRole("button", { name: /excluir/i });
    await userEvent.click(confirmBtn);
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("chama onClose ao clicar em cancelar", async () => {
    const onClose = vi.fn();
    render(
      wrap(
        <ConfirmDialog
          open={true}
          onClose={onClose}
          onConfirm={() => {}}
          title="Título"
          cancelLabel="Cancelar"
        />
      )
    );
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("exibe título e descrição", () => {
    render(
      wrap(
        <ConfirmDialog
          open={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Excluir item"
          description="Tem certeza?"
        />
      )
    );
    expect(screen.getByText("Excluir item")).toBeInTheDocument();
    expect(screen.getByText("Tem certeza?")).toBeInTheDocument();
  });
});
