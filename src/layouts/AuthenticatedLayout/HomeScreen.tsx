import { Heading, Text, VStack } from "@chakra-ui/react";

export function HomeScreen(): React.ReactNode {
  return (
    <VStack align="stretch" gap={4}>
      <Heading size="lg">Início</Heading>
      <Text color="gray.600">
        Bem-vindo ao Geofence Admin. Use o menu para acessar Campanhas.
      </Text>
    </VStack>
  );
}
