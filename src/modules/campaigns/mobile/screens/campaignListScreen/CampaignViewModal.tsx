import { useEffect, useState } from "react";
import {
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
  Text,
  Spinner,
  Box,
  VStack,
} from "@chakra-ui/react";
import { campaignController } from "@modules/campaigns/business";
import type { CampaignHeader, CampaignWithItems } from "@/types/campaign";

interface CampaignViewModalProps {
  campaign: CampaignHeader | null;
  onClose: () => void;
}

export function CampaignViewModal({ campaign, onClose }: CampaignViewModalProps): React.ReactNode {
  const [full, setFull] = useState<CampaignWithItems | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campaign) {
      setFull(null);
      return;
    }
    setLoading(true);
    campaignController
      .getById(campaign.id)
      .then((result) => {
        if (result.success && result.data) setFull(result.data);
        else setFull(null);
      })
      .finally(() => setLoading(false));
  }, [campaign?.id]);

  if (!campaign) return null;

  return (
    <DialogRoot open={campaign !== null} onOpenChange={(e) => (!e.open ? onClose() : undefined)}>
      <DialogPositioner>
        <DialogBackdrop />
        <DialogContent maxW="640px">
          <DialogHeader>
            <DialogTitle>{campaign.name}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            {loading ? (
              <Box py={6} display="flex" justifyContent="center">
                <Spinner size="lg" />
              </Box>
            ) : full ? (
              <VStack align="stretch" gap={4}>
                <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px" }}>
                  <dt><strong>Cidade/UF</strong></dt>
                  <dd>{full.city_uf ?? "—"}</dd>
                  <dt><strong>Data de expiração</strong></dt>
                  <dd>{full.exp_date ? new Date(full.exp_date).toLocaleDateString("pt-BR") : "—"}</dd>
                  <dt><strong>Ativa</strong></dt>
                  <dd>{full.enabled ? "Sim" : "Não"}</dd>
                  <dt><strong>Excluída</strong></dt>
                  <dd>{full.is_deleted ? "Sim" : "Não"}</dd>
                </dl>
                {(full.enter || full.dwell || full.exit) && (
                  <>
                    <Text fontWeight="semibold" color="gray.800" mt={2}>Itens (geofence)</Text>
                    {full.enter && (
                      <ItemBlock label="Entrada" item={full.enter} />
                    )}
                    {full.dwell && (
                      <ItemBlock label="Permanência" item={full.dwell} />
                    )}
                    {full.exit && (
                      <ItemBlock label="Saída" item={full.exit} />
                    )}
                  </>
                )}
                {!full.enter && !full.dwell && !full.exit && (
                  <Text color="gray.500" fontSize="sm">Nenhum item cadastrado.</Text>
                )}
              </VStack>
            ) : (
              <Text color="gray.500">Não foi possível carregar os dados.</Text>
            )}
          </DialogBody>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}

function ItemBlock({
  label,
  item,
}: {
  label: string;
  item: { title: string; description: string | null; lat: string | number; long: string | number; radius: number };
}): React.ReactNode {
  return (
    <Box p={3} borderRadius="md" bg="gray.50" borderWidth="1px" borderColor="gray.200">
      <Text fontWeight="medium" color="gray.800" mb={2}>{label}: {item.title}</Text>
      <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 12px", fontSize: "0.875rem" }}>
        {item.description && (
          <>
            <dt><strong>Descrição</strong></dt>
            <dd>{item.description}</dd>
          </>
        )}
        <dt><strong>Lat</strong></dt>
        <dd>{String(item.lat)}</dd>
        <dt><strong>Long</strong></dt>
        <dd>{String(item.long)}</dd>
        <dt><strong>Raio (m)</strong></dt>
        <dd>{item.radius}</dd>
      </dl>
    </Box>
  );
}
