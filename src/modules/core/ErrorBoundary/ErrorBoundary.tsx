import { Component, type ErrorInfo, type ReactNode } from "react";
import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary:", error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <Box p={8} maxW="md" mx="auto">
          <VStack align="stretch" gap={4}>
            <Heading size="md">Algo deu errado</Heading>
            <Text color="text.muted">{this.state.error.message}</Text>
            <Button onClick={this.handleRetry} alignSelf="flex-start">
              Tentar novamente
            </Button>
          </VStack>
        </Box>
      );
    }
    return this.props.children;
  }
}
