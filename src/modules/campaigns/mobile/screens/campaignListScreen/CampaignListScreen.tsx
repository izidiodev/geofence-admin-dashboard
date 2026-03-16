import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Box,
  Button,
  Checkbox,
  Heading,
  HStack,
  Input,
  NativeSelectRoot,
  NativeSelectField,
  NativeSelectIndicator,
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumnHeader,
  Text,
  VStack,
} from "@chakra-ui/react";
import { campaignController } from "@modules/campaigns/business";
import type { Campaign, CampaignListParams } from "@/types/campaign";
import { showApiResultSnackbar } from "@/utils/showApiResultSnackbar";
import { ConfirmDialog } from "@/DS/ConfirmDialog/ConfirmDialog";
import { CampaignFormModal } from "./CampaignFormModal";
import { CampaignViewModal } from "./CampaignViewModal";

const LIMIT_OPTIONS = [10, 20, 50];

/** Alinhamento das colunas (altere aqui para ajustar título e dados de uma vez). */
const COL_ALIGN = {
  name: "left" as const,
  city_uf: "center" as const,
  radius: "center" as const,
  enabled: "center" as const,
  is_deleted: "center" as const,
  actions: "right" as const,
};

type SearchField = "name" | "city_uf";

export function CampaignListScreen(): React.ReactNode {
  const [items, setItems] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  const [searchField, setSearchField] = useState<SearchField>("name");
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [filterExcluidas, setFilterExcluidas] = useState(false);
  const [filterAtivas, setFilterAtivas] = useState(true);

  const [viewCampaign, setViewCampaign] = useState<Campaign | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [deleteCampaign, setDeleteCampaign] = useState<Campaign | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadList = useCallback(async () => {
    const params: CampaignListParams = {
      page,
      limit,
      search: searchValue ? searchValue : undefined,
      search_in: searchValue ? searchField : undefined,
      is_deleted: filterExcluidas,
      enabled: filterAtivas,
    };
    setLoading(true);
    const result = await campaignController.list(params);
    setLoading(false);
    if (result.success && result.data) {
      setItems(result.data.items);
      setTotal(result.data.total);
      setTotalPages(result.data.totalPages);
    } else {
      showApiResultSnackbar(result);
    }
  }, [page, limit, searchField, searchValue, filterExcluidas, filterAtivas]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearchValue(searchInput.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const handleCreateSuccess = (): void => {
    setCreateOpen(false);
    loadList();
  };
  const handleEditSuccess = (): void => {
    setEditCampaign(null);
    loadList();
  };
  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteCampaign) return;
    setDeleteLoading(true);
    const result = await campaignController.softDelete(deleteCampaign.id);
    setDeleteLoading(false);
    showApiResultSnackbar(result, { successMessage: "Campanha excluída." });
    if (result.success) {
      setDeleteCampaign(null);
      loadList();
    }
  };

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <VStack align="stretch" gap={6}>
      <Heading size="lg">Campanhas</Heading>

      <HStack gap={4} flexWrap="wrap">
        <Button onClick={() => setCreateOpen(true)} colorPalette="blue" minW="120px">
          Nova campanha
        </Button>
      </HStack>

      <HStack gap={4} flexWrap="wrap" align="center">
        <NativeSelectRoot
          width="160px"
          position="relative"
          borderWidth="1px"
          borderRadius="md"
          bg="white"
          _focusWithin={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
        >
          <NativeSelectField
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as SearchField)}
            pr="8"
            py="2"
            pl="3"
            width="100%"
            border="none"
            bg="transparent"
            cursor="pointer"
            appearance="none"
          >
            <option value="name">Nome</option>
            <option value="city_uf">Cidade/UF</option>
          </NativeSelectField>
          <Box
            position="absolute"
            right="2"
            top="50%"
            transform="translateY(-50%)"
            pointerEvents="none"
            color="gray.500"
          >
            <NativeSelectIndicator />
          </Box>
        </NativeSelectRoot>
        <Input
          placeholder="Buscar"
          width="576px"
          maxW="100%"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Checkbox.Root
          checked={filterExcluidas}
          onCheckedChange={(e) => {
            setFilterExcluidas(Boolean(e.checked));
            setPage(1);
          }}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Excluídas</Checkbox.Label>
        </Checkbox.Root>
        <Checkbox.Root
          checked={filterAtivas}
          onCheckedChange={(e) => {
            setFilterAtivas(Boolean(e.checked));
            setPage(1);
          }}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Ativas</Checkbox.Label>
        </Checkbox.Root>
      </HStack>

      <Box
        overflowX="auto"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.200"
        bg="white"
        shadow="sm"
      >
        <TableRoot tableLayout="fixed">
          <TableHeader>
            <TableRow bg="gray.50" _hover={{ bg: "gray.50" }}>
              <TableColumnHeader
                textAlign={COL_ALIGN.name}
                py={3}
                px={4}
                fontWeight="semibold"
                color="gray.700"
                borderBottomWidth="1px"
                borderColor="gray.200"
                maxW="280px"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                Nome
              </TableColumnHeader>
              <TableColumnHeader
                textAlign={COL_ALIGN.city_uf}
                py={3}
                px={4}
                fontWeight="semibold"
                color="gray.700"
                borderBottomWidth="1px"
                borderColor="gray.200"
                maxW="160px"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                Cidade/UF
              </TableColumnHeader>
              <TableColumnHeader
                textAlign={COL_ALIGN.radius}
                py={3}
                px={4}
                fontWeight="semibold"
                color="gray.700"
                borderBottomWidth="1px"
                borderColor="gray.200"
                maxW="100px"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                Raio (m)
              </TableColumnHeader>
              <TableColumnHeader textAlign={COL_ALIGN.enabled} py={3} px={4} fontWeight="semibold" color="gray.700" borderBottomWidth="1px" borderColor="gray.200">
                Ativa
              </TableColumnHeader>
              <TableColumnHeader textAlign={COL_ALIGN.is_deleted} py={3} px={4} fontWeight="semibold" color="gray.700" borderBottomWidth="1px" borderColor="gray.200">
                Excluída
              </TableColumnHeader>
              <TableColumnHeader textAlign={COL_ALIGN.actions} py={3} px={4} fontWeight="semibold" color="gray.700" borderBottomWidth="1px" borderColor="gray.200">
                Ações
              </TableColumnHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} textAlign="center" py={8} color="gray.500">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} textAlign="center" py={8} color="gray.500">
                  Nenhuma campanha encontrada.
                </TableCell>
              </TableRow>
            ) : (
              items.map((c) => (
                <TableRow
                  key={c.id}
                  bg={c.is_deleted ? "red.50" : undefined}
                  _hover={{ bg: c.is_deleted ? "red.100" : "gray.50" }}
                  borderBottomWidth="1px"
                  borderColor="gray.100"
                  _last={{ borderBottomWidth: 0 }}
                >
                  <TableCell
                    textAlign={COL_ALIGN.name}
                    py={3}
                    px={4}
                    maxW="280px"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    title={c.name}
                  >
                    {c.name}
                  </TableCell>
                  <TableCell
                    textAlign={COL_ALIGN.city_uf}
                    py={3}
                    px={4}
                    maxW="160px"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    title={c.city_uf ?? undefined}
                  >
                    {c.city_uf ?? "—"}
                  </TableCell>
                  <TableCell
                    textAlign={COL_ALIGN.radius}
                    py={3}
                    px={4}
                    maxW="100px"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    title={c.radius != null ? String(c.radius) : undefined}
                  >
                    {c.radius}
                  </TableCell>
                  <TableCell textAlign={COL_ALIGN.enabled} py={3} px={4}>{c.enabled ? "Sim" : "Não"}</TableCell>
                  <TableCell textAlign={COL_ALIGN.is_deleted} py={3} px={4}>{c.is_deleted ? "Sim" : "Não"}</TableCell>
                  <TableCell textAlign={COL_ALIGN.actions} py={3} px={4}>
                    <HStack justify={COL_ALIGN.actions === "right" ? "flex-end" : COL_ALIGN.actions === "center" ? "center" : "flex-start"} gap={2}>
                      <Button size="sm" variant="outline" onClick={() => setViewCampaign(c)}>
                        Ver
                      </Button>
                      {!c.is_deleted && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setEditCampaign(c)}>
                            Editar
                          </Button>
                          <Button size="sm" colorPalette="red" variant="outline" onClick={() => setDeleteCampaign(c)}>
                            Excluir
                          </Button>
                        </>
                      )}
                    </HStack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </TableRoot>
      </Box>

      <HStack justify="space-between" flexWrap="wrap" gap={2}>
        <Text fontSize="sm" color="gray.600">
          Mostrando {items.length === 0 ? 0 : start}–{end} de {total}
        </Text>
        <HStack gap={2}>
          <NativeSelectRoot
            width="140px"
            minW="140px"
            position="relative"
            borderWidth="1px"
            borderRadius="md"
            bg="white"
            _focusWithin={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
          >
            <NativeSelectField
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              pr="8"
              py="2"
              pl="3"
              width="100%"
              border="none"
              bg="transparent"
              cursor="pointer"
              appearance="none"
            >
              {LIMIT_OPTIONS.map((n) => (
                <option key={n} value={n}>{n} por página</option>
              ))}
            </NativeSelectField>
            <Box
              position="absolute"
              right="2"
              top="50%"
              transform="translateY(-50%)"
              pointerEvents="none"
              color="gray.500"
            >
              <NativeSelectIndicator />
            </Box>
          </NativeSelectRoot>
          <Button size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <Text fontSize="sm">Página {page} de {totalPages || 1}</Text>
          <Button size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Próxima
          </Button>
        </HStack>
      </HStack>

      <CampaignViewModal campaign={viewCampaign} onClose={() => setViewCampaign(null)} />
      <CampaignFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      {editCampaign && (
        <CampaignFormModal
          open={true}
          onClose={() => setEditCampaign(null)}
          onSuccess={handleEditSuccess}
          campaign={editCampaign}
        />
      )}
      <ConfirmDialog
        open={deleteCampaign !== null}
        onClose={() => setDeleteCampaign(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir campanha"
        description="Deseja realmente excluir esta campanha? (exclusão lógica)"
        confirmLabel="Excluir"
        variant="danger"
        isLoading={deleteLoading}
      />
    </VStack>
  );
}
