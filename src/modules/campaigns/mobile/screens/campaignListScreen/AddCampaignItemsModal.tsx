import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Button,
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Input,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { campaignController } from "@modules/campaigns/business";
import {
  CAMPAIGN_VALIDATION,
  isDecimalInRange,
  isIntegerInRange,
  isValidNumber,
} from "@modules/campaigns/constants/campaignValidation";
import { typeRepository } from "@modules/types/business/main";
import type { CreateCampaignItemDTO } from "@/types/campaign";
import type { Type } from "@/types/type";
import { showApiResultSnackbar } from "@/utils/showApiResultSnackbar";
import { FormField } from "@/DS/FormField/FormField";
import { CAMPAIGN_MESSAGES } from "@/constants/messages";

type EventKind = "enter" | "dwell" | "exit";

const TYPE_NAME_BY_KIND: Record<EventKind, string[]> = {
  enter: ["entrada", "enter"],
  dwell: ["permanência", "permanencia", "dwell"],
  exit: ["saída", "saida", "exit"],
};

function findTypeByKind(types: Type[], kind: EventKind): Type | undefined {
  const keywords = TYPE_NAME_BY_KIND[kind];
  const normalized = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "");
  return types.find((t) => {
    const name = normalized(t.name);
    return keywords.some((kw) => name.includes(normalized(kw)));
  });
}

const KIND_LABEL: Record<EventKind, string> = {
  enter: "Entrada",
  dwell: "Permanência",
  exit: "Saída",
};

interface AddCampaignItemsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaignId: string;
  campaignName: string;
}

interface FormValues {
  enter_title: string;
  enter_description: string;
  enter_lat: string;
  enter_long: string;
  enter_radius: string;
  dwell_title: string;
  dwell_description: string;
  dwell_lat: string;
  dwell_long: string;
  dwell_radius: string;
  exit_title: string;
  exit_description: string;
  exit_lat: string;
  exit_long: string;
  exit_radius: string;
}

const defaultValues: FormValues = {
  enter_title: "",
  enter_description: "",
  enter_lat: "",
  enter_long: "",
  enter_radius: "",
  dwell_title: "",
  dwell_description: "",
  dwell_lat: "",
  dwell_long: "",
  dwell_radius: "",
  exit_title: "",
  exit_description: "",
  exit_lat: "",
  exit_long: "",
  exit_radius: "",
};

export function AddCampaignItemsModal({
  open,
  onClose,
  onSuccess,
  campaignId,
  campaignName,
}: AddCampaignItemsModalProps): React.ReactNode {
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [typesFromApi, setTypesFromApi] = useState<Type[]>([]);

  const typeEnter = useMemo(() => findTypeByKind(typesFromApi, "enter"), [typesFromApi]);
  const typeDwell = useMemo(() => findTypeByKind(typesFromApi, "dwell"), [typesFromApi]);
  const typeExit = useMemo(() => findTypeByKind(typesFromApi, "exit"), [typesFromApi]);

  const { control, handleSubmit, reset } = useForm<FormValues>({ defaultValues });

  useEffect(() => {
    if (open) {
      setLoadingTypes(true);
      typeRepository
        .list({ page: 1, limit: 100 })
        .then((result) => {
          if (result.success && result.data) setTypesFromApi(result.data.items);
          else setTypesFromApi([]);
        })
        .finally(() => setLoadingTypes(false));
    } else {
      setTypesFromApi([]);
    }
  }, [open]);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      if (!typeEnter?.id || !typeDwell?.id || !typeExit?.id) {
        showApiResultSnackbar({ success: false, error: "Tipos Entrada, Permanência e Saída não encontrados." });
        return;
      }
      setLoading(true);
      const items: { kind: EventKind; dto: CreateCampaignItemDTO }[] = [
        {
          kind: "enter",
          dto: {
            title: values.enter_title.trim(),
            description: values.enter_description.trim() || undefined,
            type_id: typeEnter.id,
            lat: Number(values.enter_lat),
            long: Number(values.enter_long),
            radius: Math.round(Number(values.enter_radius)),
          },
        },
        {
          kind: "dwell",
          dto: {
            title: values.dwell_title.trim(),
            description: values.dwell_description.trim() || undefined,
            type_id: typeDwell.id,
            lat: Number(values.dwell_lat),
            long: Number(values.dwell_long),
            radius: Math.round(Number(values.dwell_radius)),
          },
        },
        {
          kind: "exit",
          dto: {
            title: values.exit_title.trim(),
            description: values.exit_description.trim() || undefined,
            type_id: typeExit.id,
            lat: Number(values.exit_lat),
            long: Number(values.exit_long),
            radius: Math.round(Number(values.exit_radius)),
          },
        },
      ];
      let allOk = true;
      for (const { dto } of items) {
        const result = await campaignController.addItem(campaignId, dto);
        if (!result.success) {
          showApiResultSnackbar(result);
          allOk = false;
          break;
        }
      }
      setLoading(false);
      if (allOk) {
        showApiResultSnackbar({ success: true, data: null }, { successMessage: CAMPAIGN_MESSAGES.allItemsCreated });
        reset(defaultValues);
        onClose();
        onSuccess();
      }
    },
    [campaignId, typeEnter?.id, typeDwell?.id, typeExit?.id, onSuccess, reset]
  );

  return (
    <DialogRoot open={open} onOpenChange={(e) => (!e.open ? onClose() : undefined)}>
      <DialogPositioner>
        <DialogBackdrop />
        <DialogContent maxW="1200px" width="95vw">
          <DialogHeader>
            <DialogTitle>{CAMPAIGN_MESSAGES.addItemsTitle} — {campaignName}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogBody>
              <Text color="gray.600" mb={4} fontSize="sm">
                {CAMPAIGN_MESSAGES.addItemsSubtitle}
              </Text>
              {loadingTypes ? (
                <Text color="gray.600" py={4}>Carregando tipos…</Text>
              ) : (
                <HStack gap={4} align="flex-start" flexWrap="wrap" width="100%">
                  {(["enter", "dwell", "exit"] as const).map((kind) => (
                    <ItemSection key={kind} kind={kind} control={control} />
                  ))}
                </HStack>
              )}
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} minW="100px">
                {CAMPAIGN_MESSAGES.cancel}
              </Button>
              <Button type="submit" loading={loading} minW="140px" disabled={loadingTypes}>
                {CAMPAIGN_MESSAGES.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}

function ItemSection({
  kind,
  control,
}: {
  kind: EventKind;
  control: ReturnType<typeof useForm<FormValues>>["control"];
}): React.ReactNode {
  const prefix = kind;

  return (
    <Box flex="1" minW="260px" p={4} borderRadius="md" borderWidth="1px" borderColor="gray.200" bg="gray.50">
      <Text fontWeight="semibold" color="gray.800" mb={3} fontSize="md">
        {KIND_LABEL[kind]}
      </Text>
      <VStack align="stretch" gap={3} as="div">
        <Controller
          name={`${prefix}_title` as keyof FormValues}
          control={control}
          rules={{
            required: CAMPAIGN_MESSAGES.itemTitleRequired,
            maxLength: {
              value: CAMPAIGN_VALIDATION.TITLE_MAX_LENGTH,
              message: CAMPAIGN_MESSAGES.campaignNameMax(CAMPAIGN_VALIDATION.TITLE_MAX_LENGTH),
            },
          }}
          render={({ field, fieldState }) => (
            <FormField label={CAMPAIGN_MESSAGES.itemTitle} error={fieldState.error?.message} htmlFor={`${prefix}-title`}>
              <Input id={`${prefix}-title`} {...field} size="sm" maxLength={CAMPAIGN_VALIDATION.TITLE_MAX_LENGTH + 1} />
            </FormField>
          )}
        />
        <Controller
          name={`${prefix}_description` as keyof FormValues}
          control={control}
          rules={{
            maxLength: {
              value: CAMPAIGN_VALIDATION.DESCRIPTION_MAX_LENGTH,
              message: CAMPAIGN_MESSAGES.itemDescriptionMax(CAMPAIGN_VALIDATION.DESCRIPTION_MAX_LENGTH),
            },
          }}
          render={({ field, fieldState }) => (
            <FormField label={CAMPAIGN_MESSAGES.itemDescription} error={fieldState.error?.message} htmlFor={`${prefix}-desc`}>
              <Input id={`${prefix}-desc`} {...field} placeholder="Opcional" size="sm" maxLength={CAMPAIGN_VALIDATION.DESCRIPTION_MAX_LENGTH + 1} />
            </FormField>
          )}
        />
        <Controller
          name={`${prefix}_lat` as keyof FormValues}
          control={control}
          rules={{
            required: "Latitude é obrigatória",
            validate: (v) => {
              if (!isValidNumber(v)) return "Latitude deve ser um número";
              if (!isDecimalInRange(v, CAMPAIGN_VALIDATION.ITEM_LAT_MIN, CAMPAIGN_VALIDATION.ITEM_LAT_MAX)) {
                return `Latitude entre ${CAMPAIGN_VALIDATION.ITEM_LAT_MIN} e ${CAMPAIGN_VALIDATION.ITEM_LAT_MAX}`;
              }
              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <FormField label="Latitude" error={fieldState.error?.message} htmlFor={`${prefix}-lat`}>
              <Input
                id={`${prefix}-lat`}
                type="number"
                step="any"
                {...field}
                size="sm"
                min={CAMPAIGN_VALIDATION.ITEM_LAT_MIN}
                max={CAMPAIGN_VALIDATION.ITEM_LAT_MAX}
              />
            </FormField>
          )}
        />
        <Controller
          name={`${prefix}_long` as keyof FormValues}
          control={control}
          rules={{
            required: "Longitude é obrigatória",
            validate: (v) => {
              if (!isValidNumber(v)) return "Longitude deve ser um número";
              if (!isDecimalInRange(v, CAMPAIGN_VALIDATION.ITEM_LONG_MIN, CAMPAIGN_VALIDATION.ITEM_LONG_MAX)) {
                return `Longitude entre ${CAMPAIGN_VALIDATION.ITEM_LONG_MIN} e ${CAMPAIGN_VALIDATION.ITEM_LONG_MAX}`;
              }
              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <FormField label="Longitude" error={fieldState.error?.message} htmlFor={`${prefix}-long`}>
              <Input
                id={`${prefix}-long`}
                type="number"
                step="any"
                {...field}
                size="sm"
                min={CAMPAIGN_VALIDATION.ITEM_LONG_MIN}
                max={CAMPAIGN_VALIDATION.ITEM_LONG_MAX}
              />
            </FormField>
          )}
        />
        <Controller
          name={`${prefix}_radius` as keyof FormValues}
          control={control}
          rules={{
            required: "Raio é obrigatório",
            validate: (v) =>
              isIntegerInRange(v, CAMPAIGN_VALIDATION.RADIUS_MIN, CAMPAIGN_VALIDATION.RADIUS_MAX) ||
              `Raio entre ${CAMPAIGN_VALIDATION.RADIUS_MIN} e ${CAMPAIGN_VALIDATION.RADIUS_MAX}`,
          }}
          render={({ field, fieldState }) => (
            <FormField label="Raio (m)" error={fieldState.error?.message} htmlFor={`${prefix}-radius`}>
              <Input
                id={`${prefix}-radius`}
                type="number"
                {...field}
                size="sm"
                min={CAMPAIGN_VALIDATION.RADIUS_MIN}
                max={CAMPAIGN_VALIDATION.RADIUS_MAX}
              />
            </FormField>
          )}
        />
      </VStack>
    </Box>
  );
}
