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
  Checkbox,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { campaignController } from "@modules/campaigns/business";
import {
  CAMPAIGN_VALIDATION,
  isDecimalInRange,
  isIntegerInRange,
  isValidDateString,
  isValidNumber,
} from "@modules/campaigns/constants/campaignValidation";
import { typeRepository } from "@modules/types/business/main";
import type { Campaign, CreateCampaignFullDTO } from "@/types/campaign";
import type { Type } from "@/types/type";
import { showApiResultSnackbar } from "@/utils/showApiResultSnackbar";
import { FormField } from "@/DS/FormField/FormField";

interface CampaignFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaign?: Campaign | null;
}

type EventKind = "enter" | "dwell" | "exit";

interface FormValues {
  enter_name: string;
  enter_description: string;
  enter_exp_date: string;
  enter_city_uf: string;
  enter_enabled: boolean;
  enter_lat: string;
  enter_long: string;
  enter_radius: string;
  dwell_name: string;
  dwell_description: string;
  dwell_exp_date: string;
  dwell_city_uf: string;
  dwell_enabled: boolean;
  dwell_lat: string;
  dwell_long: string;
  dwell_radius: string;
  exit_name: string;
  exit_description: string;
  exit_exp_date: string;
  exit_city_uf: string;
  exit_enabled: boolean;
  exit_lat: string;
  exit_long: string;
  exit_radius: string;
}

const defaultValues: FormValues = {
  enter_name: "",
  enter_description: "",
  enter_exp_date: "",
  enter_city_uf: "",
  enter_enabled: true,
  enter_lat: "",
  enter_long: "",
  enter_radius: "",
  dwell_name: "",
  dwell_description: "",
  dwell_exp_date: "",
  dwell_city_uf: "",
  dwell_enabled: true,
  dwell_lat: "",
  dwell_long: "",
  dwell_radius: "",
  exit_name: "",
  exit_description: "",
  exit_exp_date: "",
  exit_city_uf: "",
  exit_enabled: true,
  exit_lat: "",
  exit_long: "",
  exit_radius: "",
};

/** Nomes que identificam cada tipo (PT e EN) para a coluna correspondente: Entrada | Permanência | Saída. */
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

interface DivisionSectionProps {
  kind: EventKind;
  control: ReturnType<typeof useForm<FormValues>>["control"];
}

const KIND_LABEL: Record<EventKind, string> = {
  enter: "Entrada",
  dwell: "Permanência",
  exit: "Saída",
};

function DivisionSection({ kind, control }: DivisionSectionProps): React.ReactNode {
  const prefix = kind;

  return (
    <Box
      flex="1"
      minW="260px"
      p={4}
      borderRadius="md"
      borderWidth="1px"
      borderColor="gray.200"
      bg="gray.50"
    >
      <Text fontWeight="semibold" color="gray.800" mb={3} fontSize="md">
        {KIND_LABEL[kind]}
      </Text>
      <VStack align="stretch" gap={3} as="div">
        <Controller
          name={`${prefix}_name` as keyof FormValues}
          control={control}
          rules={{
            required: "Nome é obrigatório",
            maxLength: {
              value: CAMPAIGN_VALIDATION.NAME_MAX_LENGTH,
              message: `Máximo ${CAMPAIGN_VALIDATION.NAME_MAX_LENGTH} caracteres`,
            },
          }}
          render={({ field, fieldState }) => (
            <FormField label="Nome" error={fieldState.error?.message}>
              <Input id={`${prefix}-name`} {...field} size="sm" maxLength={CAMPAIGN_VALIDATION.NAME_MAX_LENGTH + 1} />
            </FormField>
          )}
        />
        <Controller
          name={`${prefix}_description` as keyof FormValues}
          control={control}
          rules={{
            maxLength: {
              value: CAMPAIGN_VALIDATION.DESCRIPTION_MAX_LENGTH,
              message: `Máximo ${CAMPAIGN_VALIDATION.DESCRIPTION_MAX_LENGTH} caracteres`,
            },
          }}
          render={({ field, fieldState }) => (
            <FormField label="Descrição" error={fieldState.error?.message}>
              <Input id={`${prefix}-desc`} {...field} placeholder="Opcional" size="sm" maxLength={CAMPAIGN_VALIDATION.DESCRIPTION_MAX_LENGTH + 1} />
            </FormField>
          )}
        />
        <Controller
          name={`${prefix}_exp_date` as keyof FormValues}
          control={control}
          rules={{
            validate: (v) => isValidDateString(typeof v === "string" ? v : "") || "Data de expiração inválida",
          }}
          render={({ field, fieldState }) => (
            <FormField label="Data de expiração" error={fieldState.error?.message}>
              <Input id={`${prefix}-exp`} type="date" {...field} size="sm" />
            </FormField>
          )}
        />
        <Controller
          name={`${prefix}_city_uf` as keyof FormValues}
          control={control}
          rules={{
            maxLength: {
              value: CAMPAIGN_VALIDATION.CITY_UF_MAX_LENGTH,
              message: `Máximo ${CAMPAIGN_VALIDATION.CITY_UF_MAX_LENGTH} caracteres`,
            },
          }}
          render={({ field, fieldState }) => (
            <FormField label="Cidade/UF" error={fieldState.error?.message}>
              <Input id={`${prefix}-city`} {...field} placeholder="Ex: São Paulo - SP" size="sm" maxLength={CAMPAIGN_VALIDATION.CITY_UF_MAX_LENGTH + 1} />
            </FormField>
          )}
        />
        <Controller
          name={`${prefix}_enabled` as keyof FormValues}
          control={control}
          render={({ field }) => (
            <Checkbox.Root
              id={`${prefix}-enabled`}
              checked={field.value}
              onCheckedChange={(e) => field.onChange(Boolean(e.checked))}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>Ativa</Checkbox.Label>
            </Checkbox.Root>
          )}
        />
        <Controller
          name={`${prefix}_lat` as keyof FormValues}
          control={control}
          rules={{
            required: "Latitude é obrigatória",
            validate: (v) => {
              if (!isValidNumber(v)) return "Latitude deve ser um número";
              if (!isDecimalInRange(v, CAMPAIGN_VALIDATION.LAT_LONG_MIN, CAMPAIGN_VALIDATION.LAT_LONG_MAX)) {
                return `Latitude entre ${CAMPAIGN_VALIDATION.LAT_LONG_MIN} e ${CAMPAIGN_VALIDATION.LAT_LONG_MAX}`;
              }
              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <FormField label="Latitude" error={fieldState.error?.message}>
              <Input
                id={`${prefix}-lat`}
                type="number"
                step="any"
                {...field}
                size="sm"
                min={CAMPAIGN_VALIDATION.LAT_LONG_MIN}
                max={CAMPAIGN_VALIDATION.LAT_LONG_MAX}
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
              if (!isDecimalInRange(v, CAMPAIGN_VALIDATION.LAT_LONG_MIN, CAMPAIGN_VALIDATION.LAT_LONG_MAX)) {
                return `Longitude entre ${CAMPAIGN_VALIDATION.LAT_LONG_MIN} e ${CAMPAIGN_VALIDATION.LAT_LONG_MAX}`;
              }
              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <FormField label="Longitude" error={fieldState.error?.message}>
              <Input
                id={`${prefix}-long`}
                type="number"
                step="any"
                {...field}
                size="sm"
                min={CAMPAIGN_VALIDATION.LAT_LONG_MIN}
                max={CAMPAIGN_VALIDATION.LAT_LONG_MAX}
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
              `Raio deve ser inteiro entre ${CAMPAIGN_VALIDATION.RADIUS_MIN} e ${CAMPAIGN_VALIDATION.RADIUS_MAX}`,
          }}
          render={({ field, fieldState }) => (
            <FormField label="Raio (m)" error={fieldState.error?.message}>
              <Input id={`${prefix}-radius`} type="number" min={CAMPAIGN_VALIDATION.RADIUS_MIN} max={CAMPAIGN_VALIDATION.RADIUS_MAX} {...field} size="sm" />
            </FormField>
          )}
        />
      </VStack>
    </Box>
  );
}

export function CampaignFormModal({
  open,
  onClose,
  onSuccess,
  campaign,
}: CampaignFormModalProps): React.ReactNode {
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [typesFromApi, setTypesFromApi] = useState<Type[]>([]);
  const isEdit = Boolean(campaign);

  const typeEnter = useMemo(() => findTypeByKind(typesFromApi, "enter"), [typesFromApi]);
  const typeDwell = useMemo(() => findTypeByKind(typesFromApi, "dwell"), [typesFromApi]);
  const typeExit = useMemo(() => findTypeByKind(typesFromApi, "exit"), [typesFromApi]);

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      setLoadingTypes(true);
      typeRepository
        .list({ page: 1, limit: 10 })
        .then((result) => {
          if (result.success && result.data) {
            setTypesFromApi(result.data.items);
          } else {
            setTypesFromApi([]);
          }
        })
        .finally(() => setLoadingTypes(false));
    } else {
      setTypesFromApi([]);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (campaign) {
        reset({
          enter_name: campaign.name,
          enter_description: campaign.description ?? "",
          enter_exp_date: campaign.exp_date ? campaign.exp_date.slice(0, 10) : "",
          enter_city_uf: campaign.city_uf ?? "",
          enter_enabled: campaign.enabled,
          enter_lat: String(campaign.lat),
          enter_long: String(campaign.long),
          enter_radius: String(campaign.radius),
          dwell_name: campaign.name,
          dwell_description: campaign.description ?? "",
          dwell_exp_date: campaign.exp_date ? campaign.exp_date.slice(0, 10) : "",
          dwell_city_uf: campaign.city_uf ?? "",
          dwell_enabled: campaign.enabled,
          dwell_lat: String(campaign.lat),
          dwell_long: String(campaign.long),
          dwell_radius: String(campaign.radius),
          exit_name: campaign.name,
          exit_description: campaign.description ?? "",
          exit_exp_date: campaign.exp_date ? campaign.exp_date.slice(0, 10) : "",
          exit_city_uf: campaign.city_uf ?? "",
          exit_enabled: campaign.enabled,
          exit_lat: String(campaign.lat),
          exit_long: String(campaign.long),
          exit_radius: String(campaign.radius),
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, campaign, reset]);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setLoading(true);
      if (isEdit) {
        const result = await campaignController.update(campaign!.id, {
          name: values.enter_name.trim(),
          description: values.enter_description.trim() || undefined,
          exp_date: values.enter_exp_date || undefined,
          city_uf: values.enter_city_uf.trim() || undefined,
          type_id: typeEnter?.id,
          enabled: values.enter_enabled,
          lat: Number(values.enter_lat),
          long: Number(values.enter_long),
          radius: Math.round(Number(values.enter_radius)),
        });
        setLoading(false);
        showApiResultSnackbar(result, { successMessage: "Campanha atualizada." });
        if (result.success) onSuccess();
        return;
      }
      const enterTypeId = typeEnter?.id ?? "";
      const dwellTypeId = typeDwell?.id ?? "";
      const exitTypeId = typeExit?.id ?? "";

      const dto: CreateCampaignFullDTO = {
        enter: {
          name: values.enter_name.trim(),
          description: values.enter_description.trim() || undefined,
          exp_date: values.enter_exp_date || undefined,
          city_uf: values.enter_city_uf.trim() || undefined,
          type_id: enterTypeId,
          enabled: values.enter_enabled,
          lat: Number(values.enter_lat),
          long: Number(values.enter_long),
          radius: Math.round(Number(values.enter_radius)),
        },
        dwell: {
          name: values.dwell_name.trim(),
          description: values.dwell_description.trim() || undefined,
          exp_date: values.dwell_exp_date || undefined,
          city_uf: values.dwell_city_uf.trim() || undefined,
          type_id: dwellTypeId,
          enabled: values.dwell_enabled,
          lat: Number(values.dwell_lat),
          long: Number(values.dwell_long),
          radius: Math.round(Number(values.dwell_radius)),
        },
        exit: {
          name: values.exit_name.trim(),
          description: values.exit_description.trim() || undefined,
          exp_date: values.exit_exp_date || undefined,
          city_uf: values.exit_city_uf.trim() || undefined,
          type_id: exitTypeId,
          enabled: values.exit_enabled,
          lat: Number(values.exit_lat),
          long: Number(values.exit_long),
          radius: Math.round(Number(values.exit_radius)),
        },
      };
      const result = await campaignController.createTriplet(dto);
      setLoading(false);
      showApiResultSnackbar(result, {
        successMessage: "As 3 campanhas (Enter, Dwell, Exit) foram criadas.",
      });
      if (result.success) {
        onSuccess();
      }
    },
    [isEdit, campaign, typeEnter?.id, typeDwell?.id, typeExit?.id, onSuccess]
  );

  return (
    <DialogRoot open={open} onOpenChange={(e) => (!e.open ? onClose() : undefined)}>
      <DialogPositioner>
        <DialogBackdrop />
        <DialogContent maxW="1200px" width="95vw">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar campanha" : "Nova campanha"}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogBody>
              {loadingTypes ? (
                <Text color="gray.600" py={4}>
                  Carregando tipos (Entrada, Permanência, Saída)…
                </Text>
              ) : (
                <HStack gap={4} align="flex-start" flexWrap="wrap" width="100%">
                  <DivisionSection kind="enter" control={control} />
                  <DivisionSection kind="dwell" control={control} />
                  <DivisionSection kind="exit" control={control} />
                </HStack>
              )}
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} minW="120px">
                Cancelar
              </Button>
              <Button type="submit" loading={loading} minW="140px" disabled={loadingTypes}>
                {isEdit ? "Salvar" : "Criar campanha"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
