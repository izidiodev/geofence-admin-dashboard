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
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumnHeader,
  Text,
  VStack,
} from "@chakra-ui/react";
import { SelectField } from "@/ds/SelectField/SelectField";
import { campaignController } from "@modules/campaigns/business";
import type { CampaignHeader, CampaignListParams } from "@/types/campaign";
import { showApiResultSnackbar } from "@/utils/showApiResultSnackbar";
import { CAMPAIGN_MESSAGES } from "@/constants/messages";
import { ConfirmDialog } from "@/DS/ConfirmDialog/ConfirmDialog";
import { CreateCampaignModal } from "./CreateCampaignModal";
import { AddCampaignItemsModal } from "./AddCampaignItemsModal";
import { CampaignFormModal } from "./CampaignFormModal";
import { CampaignViewModal } from "./CampaignViewModal";

const LIMIT_OPTIONS = [10, 20, 50];

const COL_ALIGN = {
  name: "left" as const,
  city: "left" as const,
  uf: "center" as const,
  enabled: "center" as const,
  is_deleted: "center" as const,
  actions: "right" as const,
};

type SearchField = "name" | "city";

export function CampaignListScreen(): React.ReactNode {
  const [items, setItems] = useState<CampaignHeader[]>([]);
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

  const [viewCampaign, setViewCampaign] = useState<CampaignHeader | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [addItemsOpen, setAddItemsOpen] = useState(false);
  const [addItemsCampaignId, setAddItemsCampaignId] = useState("");
  const [addItemsCampaignName, setAddItemsCampaignName] = useState("");
  const [editCampaign, setEditCampaign] = useState<CampaignHeader | null>(null);
  const [deleteCampaign, setDeleteCampaign] = useState<CampaignHeader | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

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
    setListError(null);
    const result = await campaignController.list(params);
    setLoading(false);
    if (result.success && result.data) {
      setItems(result.data.items);
      setTotal(result.data.total);
      setTotalPages(result.data.totalPages);
      setListError(null);
    } else {
      const msg = !result.success && "error" in result ? result.error : CAMPAIGN_MESSAGES.listError;
      setListError(msg);
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

  const handleCreateSuccess = (campaignId: string, campaignName: string): void => {
    setCreateOpen(false);
    setAddItemsCampaignId(campaignId);
    setAddItemsCampaignName(campaignName);
    setAddItemsOpen(true);
  };
  const handleAddItemsSuccess = (): void => {
    setAddItemsOpen(false);
    setAddItemsCampaignId("");
    setAddItemsCampaignName("");
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
    showApiResultSnackbar(result, { successMessage: CAMPAIGN_MESSAGES.deletedSuccess });
    if (result.success) {
      setDeleteCampaign(null);
      loadList();
    }
  };

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <VStack align="stretch" gap={6}>
      <Heading size="lg">{CAMPAIGN_MESSAGES.title}</Heading>

      <HStack gap={4} flexWrap="wrap">
        <Button onClick={() => setCreateOpen(true)} colorPalette="blue" minW="120px">
          {CAMPAIGN_MESSAGES.newCampaign}
        </Button>
      </HStack>

      <HStack gap={4} flexWrap="wrap" align="center">
        <SelectField
          value={searchField}
          onChange={(v) => setSearchField(v as SearchField)}
          options={[
            { value: "name", label: CAMPAIGN_MESSAGES.searchByName },
            { value: "city", label: CAMPAIGN_MESSAGES.searchByCity },
          ]}
          width="160px"
        />
        <Input
          placeholder={CAMPAIGN_MESSAGES.searchPlaceholder}
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
          <Checkbox.Label>{CAMPAIGN_MESSAGES.filterExcluidas}</Checkbox.Label>
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
          <Checkbox.Label>{CAMPAIGN_MESSAGES.filterAtivas}</Checkbox.Label>
        </Checkbox.Root>
      </HStack>

      {listError && (
        <Box p={4} borderRadius="md" bg="red.50" borderWidth="1px" borderColor="red.200">
          <Text color="red.800" mb={2}>{listError}</Text>
          <Button size="sm" colorPalette="red" onClick={() => loadList()}>
            {CAMPAIGN_MESSAGES.tryAgain}
          </Button>
        </Box>
      )}

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
                scope="col"
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
                {CAMPAIGN_MESSAGES.colName}
              </TableColumnHeader>
              <TableColumnHeader
                scope="col"
                textAlign={COL_ALIGN.city}
                py={3}
                px={4}
                fontWeight="semibold"
                color="gray.700"
                borderBottomWidth="1px"
                borderColor="gray.200"
                maxW="200px"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {CAMPAIGN_MESSAGES.colCity}
              </TableColumnHeader>
              <TableColumnHeader
                scope="col"
                textAlign={COL_ALIGN.uf}
                py={3}
                px={4}
                fontWeight="semibold"
                color="gray.700"
                borderBottomWidth="1px"
                borderColor="gray.200"
                maxW="72px"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {CAMPAIGN_MESSAGES.colUf}
              </TableColumnHeader>
              <TableColumnHeader scope="col" textAlign={COL_ALIGN.enabled} py={3} px={4} fontWeight="semibold" color="gray.700" borderBottomWidth="1px" borderColor="gray.200">
                {CAMPAIGN_MESSAGES.colActive}
              </TableColumnHeader>
              <TableColumnHeader scope="col" textAlign={COL_ALIGN.is_deleted} py={3} px={4} fontWeight="semibold" color="gray.700" borderBottomWidth="1px" borderColor="gray.200">
                {CAMPAIGN_MESSAGES.colDeleted}
              </TableColumnHeader>
              <TableColumnHeader scope="col" textAlign={COL_ALIGN.actions} py={3} px={4} fontWeight="semibold" color="gray.700" borderBottomWidth="1px" borderColor="gray.200">
                {CAMPAIGN_MESSAGES.colActions}
              </TableColumnHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} textAlign="center" py={8} color="gray.500">
                  {CAMPAIGN_MESSAGES.loading}
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} textAlign="center" py={8} color="gray.500">
                  {CAMPAIGN_MESSAGES.noCampaigns}
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
                    textAlign={COL_ALIGN.city}
                    py={3}
                    px={4}
                    maxW="200px"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    title={c.city ?? undefined}
                  >
                    {c.city ?? "—"}
                  </TableCell>
                  <TableCell
                    textAlign={COL_ALIGN.uf}
                    py={3}
                    px={4}
                    maxW="72px"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    title={c.uf ?? undefined}
                  >
                    {c.uf ?? "—"}
                  </TableCell>
                  <TableCell textAlign={COL_ALIGN.enabled} py={3} px={4}>{c.enabled ? CAMPAIGN_MESSAGES.yes : CAMPAIGN_MESSAGES.no}</TableCell>
                  <TableCell textAlign={COL_ALIGN.is_deleted} py={3} px={4}>{c.is_deleted ? CAMPAIGN_MESSAGES.yes : CAMPAIGN_MESSAGES.no}</TableCell>
                  <TableCell textAlign={COL_ALIGN.actions} py={3} px={4}>
                    <HStack justify={COL_ALIGN.actions === "right" ? "flex-end" : COL_ALIGN.actions === "center" ? "center" : "flex-start"} gap={2}>
                      <Button size="sm" variant="outline" onClick={() => setViewCampaign(c)}>
                        {CAMPAIGN_MESSAGES.view}
                      </Button>
                      {!c.is_deleted && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setEditCampaign(c)}>
                            {CAMPAIGN_MESSAGES.edit}
                          </Button>
                          <Button size="sm" colorPalette="red" variant="outline" onClick={() => setDeleteCampaign(c)}>
                            {CAMPAIGN_MESSAGES.delete}
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
          {CAMPAIGN_MESSAGES.showing(items.length === 0 ? 0 : start, end, total)}
        </Text>
        <HStack gap={2}>
          <SelectField
            value={String(limit)}
            onChange={(v) => {
              setLimit(Number(v));
              setPage(1);
            }}
            options={LIMIT_OPTIONS.map((n) => ({ value: String(n), label: CAMPAIGN_MESSAGES.perPage(n) }))}
            width="140px"
            minWidth="140px"
          />
          <Button size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {CAMPAIGN_MESSAGES.previous}
          </Button>
          <Text fontSize="sm">{CAMPAIGN_MESSAGES.pageOf(page, totalPages)}</Text>
          <Button size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            {CAMPAIGN_MESSAGES.next}
          </Button>
        </HStack>
      </HStack>

      <CampaignViewModal campaign={viewCampaign} onClose={() => setViewCampaign(null)} />
      <CreateCampaignModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      <AddCampaignItemsModal
        open={addItemsOpen}
        onClose={() => { setAddItemsOpen(false); setAddItemsCampaignId(""); setAddItemsCampaignName(""); }}
        onSuccess={handleAddItemsSuccess}
        campaignId={addItemsCampaignId}
        campaignName={addItemsCampaignName}
      />
      {editCampaign != null && (
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
        title={CAMPAIGN_MESSAGES.deleteTitle}
        description={CAMPAIGN_MESSAGES.deleteDescription}
        confirmLabel={CAMPAIGN_MESSAGES.deleteConfirm}
        variant="danger"
        isLoading={deleteLoading}
      />
    </VStack>
  );
}
