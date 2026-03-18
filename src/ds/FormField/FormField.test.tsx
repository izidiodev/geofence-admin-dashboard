import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { FormField } from "./FormField";

function wrap(ui: React.ReactElement) {
  return <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>;
}

describe("FormField", () => {
  it("associa label ao input via htmlFor quando informado", () => {
    render(
      wrap(
        <FormField label="E-mail" htmlFor="email">
          <input id="email" data-testid="input-email" />
        </FormField>
      )
    );
    const label = screen.getByText("E-mail");
    const input = screen.getByTestId("input-email");
    expect(label).toHaveAttribute("for", "email");
    expect(input).toHaveAttribute("id", "email");
  });

  it("exibe mensagem de erro quando error é passado", () => {
    render(
      wrap(
        <FormField label="Campo" error="Campo obrigatório">
          <input id="campo" />
        </FormField>
      )
    );
    expect(screen.getByText("Campo obrigatório")).toBeInTheDocument();
  });

  it("não exibe erro quando error não é passado", () => {
    render(
      wrap(
        <FormField label="Campo">
          <input id="campo" />
        </FormField>
      )
    );
    expect(screen.queryByText("Campo obrigatório")).not.toBeInTheDocument();
  });
});
