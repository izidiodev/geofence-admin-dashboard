import {
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
} from "@chakra-ui/react";
import type { Campaign } from "@/types/campaign";

interface CampaignViewModalProps {
  campaign: Campaign | null;
  onClose: () => void;
}

export function CampaignViewModal({ campaign, onClose }: CampaignViewModalProps): React.ReactNode {
  if (!campaign) return null;
  return (
    <DialogRoot open={campaign !== null} onOpenChange={(e) => (!e.open ? onClose() : undefined)}>
      <DialogPositioner>
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{campaign.name}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px" }}>
              <dt><strong>Descrição</strong></dt>
              <dd>{campaign.description ?? "—"}</dd>
              <dt><strong>Cidade/UF</strong></dt>
              <dd>{campaign.city_uf ?? "—"}</dd>
              <dt><strong>Data de expiração</strong></dt>
              <dd>{campaign.exp_date ? new Date(campaign.exp_date).toLocaleDateString("pt-BR") : "—"}</dd>
              <dt><strong>Latitude</strong></dt>
              <dd>{String(campaign.lat)}</dd>
              <dt><strong>Longitude</strong></dt>
              <dd>{String(campaign.long)}</dd>
              <dt><strong>Raio (m)</strong></dt>
              <dd>{campaign.radius}</dd>
              <dt><strong>Ativa</strong></dt>
              <dd>{campaign.enabled ? "Sim" : "Não"}</dd>
              <dt><strong>Excluída</strong></dt>
              <dd>{campaign.is_deleted ? "Sim" : "Não"}</dd>
            </dl>
          </DialogBody>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
