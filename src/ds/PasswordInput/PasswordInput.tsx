import { useState } from "react";
import { Box, IconButton, Input } from "@chakra-ui/react";

const EyeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

interface PasswordInputProps {
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}

export function PasswordInput({
  id,
  value,
  onChange,
  onBlur,
  autoComplete,
}: PasswordInputProps): React.ReactNode {
  const [show, setShow] = useState(false);
  return (
    <Box position="relative" width="100%">
      <Input
        id={id}
        pr="10"
        type={show ? "text" : "password"}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
      />
      <IconButton
        type="button"
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        position="absolute"
        right="1"
        top="50%"
        transform="translateY(-50%)"
        size="sm"
        variant="ghost"
        onClick={() => setShow((s) => !s)}
      >
        {show ? EyeOffIcon : EyeIcon}
      </IconButton>
    </Box>
  );
}
