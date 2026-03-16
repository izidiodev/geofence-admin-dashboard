import { useEffect } from "react";
import {
  Box,
  ChakraProvider,
  createToaster,
  Toaster,
  ToastRoot,
  ToastCloseTrigger,
  ToastIndicator,
} from "@chakra-ui/react";
import { system } from "@/theme";
import { setToaster, getToaster } from "@/utils/toasterRef";
import { SESSION_EXPIRED_EVENT } from "@modules/core";
import { useNavigate } from "@modules/core";
import { PATH_LOGIN } from "@/Routes/Paths/Paths";
import type { ReactNode } from "react";

const toaster = createToaster({
  placement: "top-end",
  pauseOnPageIdle: true,
});

function SessionExpiredListener({ children }: { children: ReactNode }): ReactNode {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (): void => {
      const t = getToaster();
      t?.create({
        title: "Sessão expirada",
        description: "Faça login novamente.",
        type: "error",
        duration: 3000,
      });
      navigate(PATH_LOGIN, { replace: true });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handler);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
  }, [navigate]);
  return children;
}

function toasterLike(): Parameters<typeof setToaster>[0] {
  return {
    create: (opts) => toaster.create(opts),
  };
}

export function SnackBarProvider({ children }: { children: ReactNode }): ReactNode {
  if (!getToaster()) {
    setToaster(toasterLike());
  }

  return (
    <ChakraProvider value={system}>
      <Toaster toaster={toaster} position="fixed" zIndex={9999}>
        {(toastValue) => {
          const isSuccess = toastValue.type === "success";
          const isError = toastValue.type === "error";
          const bg = isSuccess ? "green.600" : isError ? "red.600" : "gray.700";
          const textColor = "white";
          const textMuted = "gray.200";
          return (
            <ToastRoot
              minW="320px"
              maxW="420px"
              p={4}
              gap={3}
              borderRadius="md"
              boxShadow="lg"
              bg={bg}
              color={textColor}
            >
              <ToastIndicator color={textColor} />
              <Box flex="1" minW={0}>
                {toastValue.title != null && toastValue.title !== "" ? (
                  <Box fontSize="md" fontWeight="semibold" color={textColor} mb={toastValue.description ? 1 : 0}>
                    {String(toastValue.title)}
                  </Box>
                ) : null}
                {toastValue.description != null && toastValue.description !== "" ? (
                  <Box fontSize="sm" color={textMuted}>
                    {String(toastValue.description)}
                  </Box>
                ) : null}
              </Box>
              <ToastCloseTrigger color={textMuted} />
            </ToastRoot>
          );
        }}
      </Toaster>
      <SessionExpiredListener>{children}</SessionExpiredListener>
    </ChakraProvider>
  );
}
