import { useCallback, useState } from "react";
import { Button, Card, Heading, Input, VStack } from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "@modules/core";
import { localStorageController } from "@modules/core";
import { accountController } from "@modules/account/business";
import { PATH_HOME } from "@/Routes/Paths/Paths";
import { showApiResultSnackbar } from "@/utils/showApiResultSnackbar";
import { FormField } from "@/DS/FormField/FormField";
import { PasswordInput } from "@/DS/PasswordInput/PasswordInput";

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginScreen(): React.ReactNode {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      setLoading(true);
      const result = await accountController.login({ email: values.email, password: values.password });
      setLoading(false);
      showApiResultSnackbar(result, { successMessage: "Login realizado com sucesso." });
      if (result.success && result.data) {
        localStorageController.setToken(result.data.token);
        localStorageController.setItem(
          localStorageController.getUserKey(),
          JSON.stringify(result.data.user)
        );
        navigate(PATH_HOME, { replace: true });
      }
    },
    [navigate]
  );

  return (
    <VStack minH="100vh" justify="center" p={4}>
      <Card.Root maxW="400px" w="full">
        <Card.Header>
          <Heading size="md">Geofence Admin</Heading>
        </Card.Header>
        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack align="stretch" gap={4}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "E-mail é obrigatório",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Informe um e-mail válido",
                  },
                }}
                render={({ field, fieldState }) => (
                  <FormField label="E-mail" error={fieldState.error?.message} htmlFor="email">
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      {...field}
                      autoComplete="email"
                    />
                  </FormField>
                )}
              />
              <Controller
                name="password"
                control={control}
                rules={{ required: "Senha é obrigatória", minLength: { value: 6, message: "Mínimo 6 caracteres" } }}
                render={({ field, fieldState }) => (
                  <FormField label="Senha" error={fieldState.error?.message} htmlFor="password">
                    <PasswordInput id="password" {...field} autoComplete="current-password" />
                  </FormField>
                )}
              />
              <Button type="submit" w="full" loading={loading} minW="140px">
                Entrar
              </Button>
            </VStack>
          </form>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}
