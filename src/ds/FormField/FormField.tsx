import { Box, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  /** Id do input associado; associa o label ao input para acessibilidade e clique. */
  htmlFor?: string;
  children: ReactNode;
}

export function FormField({ label, error, htmlFor, children }: FormFieldProps): ReactNode {
  const labelEl = htmlFor ? (
    <label htmlFor={htmlFor} style={{ fontWeight: 500, marginBottom: 4, display: "block", cursor: "text" }}>
      {label}
    </label>
  ) : (
    <Text fontWeight="medium" mb={1} display="block">
      {label}
    </Text>
  );
  return (
    <Box width="100%">
      {labelEl}
      {children}
      {error ? (
        <Text color="red.500" fontSize="sm" mt={1}>
          {error}
        </Text>
      ) : null}
    </Box>
  );
}
