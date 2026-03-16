import { Box, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps): ReactNode {
  return (
    <Box width="100%">
      <Text as="label" fontWeight="medium" mb={1} display="block">
        {label}
      </Text>
      {children}
      {error ? (
        <Text color="red.500" fontSize="sm" mt={1}>
          {error}
        </Text>
      ) : null}
    </Box>
  );
}
