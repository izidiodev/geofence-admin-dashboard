import { Box, VStack, Text } from "@chakra-ui/react";
import { Link, useLocation } from "@modules/core";
import { PATH_HOME, PATH_CAMPAIGNS } from "@/Routes/Paths/Paths";

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

  return (
    <Box
      as="aside"
      w="240px"
      borderRightWidth="1px"
      bg="gray.100"
      py={4}
      px={3}
    >
      <Text fontWeight="bold" fontSize="lg" mb={4} px={2}>
        Geofence Admin
      </Text>
      <VStack align="stretch" gap={1}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={linkStyle(isActive)}>
              {item.label}
            </Link>
          );
        })}
      </VStack>
    </Box>
  );
}
