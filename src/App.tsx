import { ErrorBoundary } from "@modules/core";
import { SnackBarProvider } from "@/Providers/SnackBarProvider";
import { AppRoutes } from "@/Routes/AppRoutes/AppRoutes";
import { BrowserRouter } from "@modules/core";

export function App(): React.ReactNode {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SnackBarProvider>
          <AppRoutes />
        </SnackBarProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
