import { Box, NativeSelectRoot, NativeSelectField, NativeSelectIndicator } from "@chakra-ui/react";
import type { ReactNode } from "react";

export interface SelectOption {
  value: string;
  label: ReactNode;
}

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  width?: string | number;
  minWidth?: string | number;
}

const selectRootStyles = {
  position: "relative" as const,
  borderWidth: "1px",
  borderRadius: "md",
  bg: "white",
  _focusWithin: { borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" },
};

export function SelectField({
  value,
  onChange,
  options,
  width = "160px",
  minWidth,
}: SelectFieldProps): React.ReactNode {
  return (
    <NativeSelectRoot
      width={width}
      minWidth={minWidth}
      {...selectRootStyles}
    >
      <NativeSelectField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        pr="8"
        py="2"
        pl="3"
        width="100%"
        border="none"
        bg="transparent"
        cursor="pointer"
        appearance="none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </NativeSelectField>
      <Box
        position="absolute"
        right="2"
        top="50%"
        transform="translateY(-50%)"
        pointerEvents="none"
        color="gray.500"
      >
        <NativeSelectIndicator />
      </Box>
    </NativeSelectRoot>
  );
}
