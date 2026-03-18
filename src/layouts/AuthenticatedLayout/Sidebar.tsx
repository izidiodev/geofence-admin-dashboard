import { VStack, Text, Button, Flex } from "@chakra-ui/react";
import { Link, useLocation, useNavigate } from "@modules/core";
import { localStorageController, dispatchAuthLogout } from "@modules/core";
import { PATH_HOME, PATH_CAMPAIGNS, PATH_LOGIN } from "@/Routes/Paths/Paths";
import { getToaster } from "@/utils/toasterRef";

const navItems = [
  { path: PATH_HOME, label: "Início" },
  { path: PATH_CAMPAIGNS, label: "Campanhas" },
] as const;

const linkStyle = (isActive: boolean): React.CSSProperties => ({
  display: "block",
  padding: "8px 12px",
  borderRadius: "6px",
  background: isActive ? "white" : "transparent",
  fontWeight: isActive ? 600 : 400,
  textDecoration: "none",
  color: "inherit",
});

export function Sidebar(): React.ReactNode {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    localStorageController.removeToken();
    localStorageController.removeItem(localStorageController.getUserKey());
    dispatchAuthLogout();
    getToaster()?.create({
      title: "Você saiu da conta",
      type: "success",
      duration: 2500,
    });
    navigate(PATH_LOGIN, { replace: true });
  };

  return (
    <Flex
      as="aside"
      direction="column"
      w="240px"
      minH="100vh"
      borderRightWidth="1px"
      bg="gray.100"
      py={4}
      px={3}
    >
      <Text fontWeight="bold" fontSize="lg" mb={4} px={2}>
        Geofence Admin
      </Text>
      <VStack align="stretch" gap={1} flex="1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={linkStyle(isActive)}>
              {item.label}
            </Link>
          );
        })}
      </VStack>
      <Button
        variant="outline"
        colorPalette="red"
        w="full"
        mt={4}
        onClick={handleLogout}
      >
        Sair
      </Button>
    </Flex>
  );
}
