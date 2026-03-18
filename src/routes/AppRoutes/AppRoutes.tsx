import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "@modules/core";
import { ProtectedRoute } from "@/Routes/ProtectedRoute/ProtectedRoute";
import { PublicOnlyRoute } from "@/Routes/PublicOnlyRoute/PublicOnlyRoute";
import { AuthenticatedLayout } from "@/layouts/AuthenticatedLayout/AuthenticatedLayout";
import { PATH_LOGIN, PATH_HOME, PATH_CAMPAIGNS } from "@/Routes/Paths/Paths";
import { Box, Spinner } from "@chakra-ui/react";

const LoginScreen = lazy(() =>
  import("@modules/account/mobile/screens/loginScreen/LoginScreen").then((m) => ({ default: m.LoginScreen }))
);
const CampaignListScreen = lazy(() =>
  import("@modules/campaigns/mobile/screens/campaignListScreen/CampaignListScreen").then((m) => ({
    default: m.CampaignListScreen,
  }))
);
const HomeScreen = lazy(() =>
  import("@modules/home/mobile/screens/HomeScreen/HomeScreen").then((m) => ({ default: m.HomeScreen }))
);

function Fallback(): React.ReactNode {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
      <Spinner size="lg" />
    </Box>
  );
}

export function AppRoutes(): React.ReactNode {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route
          path={PATH_LOGIN}
          element={
            <PublicOnlyRoute>
              <LoginScreen />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeScreen />} />
          <Route path={PATH_CAMPAIGNS.slice(1)} element={<CampaignListScreen />} />
        </Route>
        <Route path="*" element={<Navigate to={PATH_HOME} replace />} />
      </Routes>
    </Suspense>
  );
}
