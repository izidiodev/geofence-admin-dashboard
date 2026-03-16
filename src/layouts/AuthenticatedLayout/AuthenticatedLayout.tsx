import { Box, Flex } from "@chakra-ui/react";
import { Outlet } from "@modules/core";
import { Sidebar } from "@/layouts/AuthenticatedLayout/Sidebar";

export function AuthenticatedLayout(): React.ReactNode {
  return (
    <Flex minH="100vh" direction="row">
      <Sidebar />
      <Box flex="1" p={6} as="main">
        <Outlet />
      </Box>
    </Flex>
  );
}
