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
  Spinner,
} from "@chakra-ui/react";
import { campaignController } from "@modules/campaigns/business";
import {
  CAMPAIGN_VALIDATION,
  isValidDateString,
  validateCampaignLatLong,
  validateCampaignRadius,
} from "@modules/campaigns/constants/campaignValidation";
import { typeRepository } from "@modules/types/business/main";
import type { CampaignHeader, CampaignWithItems, UpdateCampaignDTO } from "@/types/campaign";
import type { Type } from "@/types/type";
import { showApiResultSnackbar } from "@/utils/showApiResultSnackbar";
import { FormField } from "@/DS/FormField/FormField";
import { CityUfCombobox } from "@/DS/CityUfCombobox/CityUfCombobox";
import { CAMPAIGN_MESSAGES } from "@/constants/messages";
import { validateCampaignCityUfEdit } from "@modules/campaigns/constants/campaignLocationValidation";

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

interface CampaignFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaign: CampaignHeader | null;
}

interface FormValues {
  name: string;
  exp_date: string;
  city: string;
  uf: string;
  lat: string;
  long: string;
  radius: string;
  enabled: boolean;
  enter_title: string;
  enter_description: string;
  dwell_title: string;
  dwell_description: string;
  exit_title: string;
  exit_description: string;
}

export function CampaignFormModal({
  open,
  onClose,
  onSuccess,
  campaign,
}: CampaignFormModalProps): React.ReactNode {
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingCampaign, setLoadingCampaign] = useState(false);
  const [typesFromApi, setTypesFromApi] = useState<Type[]>([]);
  const [fullCampaign, setFullCampaign] = useState<CampaignWithItems | null>(null);

  const typeEnter = useMemo(() => findTypeByKind(typesFromApi, "enter"), [typesFromApi]);
  const typeDwell = useMemo(() => findTypeByKind(typesFromApi, "dwell"), [typesFromApi]);
  const typeExit = useMemo(() => findTypeByKind(typesFromApi, "exit"), [typesFromApi]);

  const { control, handleSubmit, reset, getValues, trigger } = useForm<FormValues>({
    defaultValues: {
      name: "",
      exp_date: "",
      city: "",
      uf: "",
      lat: "",
      long: "",
      radius: "",
      enabled: true,
      enter_title: "",
      enter_description: "",
      dwell_title: "",
      dwell_description: "",
      exit_title: "",
      exit_description: "",
    },
  });

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
      setFullCampaign(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !campaign) return;
    setLoadingCampaign(true);
    campaignController
      .getById(campaign.id)
      .then((result) => {
        if (result.success && result.data) {
          setFullCampaign(result.data);
          const c = result.data;
          const toStr = (v: string | number | null | undefined) => (v != null ? String(v) : "");
          reset({
            name: c.name,
            exp_date: c.exp_date ? c.exp_date.slice(0, 10) : "",
            city: c.city ?? "",
            uf: c.uf ?? "",
            lat: toStr(c.lat),
            long: toStr(c.long),
            radius: String(c.radius),
            enabled: c.enabled,
            enter_title: c.enter?.title ?? "",
            enter_description: c.enter?.description ?? "",
            dwell_title: c.dwell?.title ?? "",
            dwell_description: c.dwell?.description ?? "",
            exit_title: c.exit?.title ?? "",
            exit_description: c.exit?.description ?? "",
          });
        } else setFullCampaign(null);
      })
      .finally(() => setLoadingCampaign(false));
  }, [open, campaign?.id, reset]);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      if (!campaign || !fullCampaign) return;
      setLoading(true);
      const dto: UpdateCampaignDTO = {
        name: values.name.trim() || undefined,
        exp_date: values.exp_date || undefined,
        city: values.city.trim() || undefined,
        uf: values.uf.trim() ? values.uf.trim().toUpperCase() : undefined,
        lat: Number(values.lat),
        long: Number(values.long),
        radius: Math.round(Number(values.radius)),
        enabled: values.enabled,
      };
      if (fullCampaign.enter) {
        dto.enter = {
          title: values.enter_title.trim(),
          description: values.enter_description.trim() || undefined,
          type_id: typeEnter?.id,
        };
      }
      if (fullCampaign.dwell) {
        dto.dwell = {
          title: values.dwell_title.trim(),
          description: values.dwell_description.trim() || undefined,
          type_id: typeDwell?.id,
        };
      }
      if (fullCampaign.exit) {
        dto.exit = {
          title: values.exit_title.trim(),
          description: values.exit_description.trim() || undefined,
          type_id: typeExit?.id,
        };
      }
      const result = await campaignController.update(campaign.id, dto);
      setLoading(false);
      showApiResultSnackbar(result, { successMessage: "Campanha atualizada." });
      if (result.success) onSuccess();
    },
    [campaign, fullCampaign, typeEnter?.id, typeDwell?.id, typeExit?.id, onSuccess]
  );

  if (!campaign) return null;

  const showForm = fullCampaign && !loadingCampaign;

  return (
    <DialogRoot open={open} onOpenChange={(e) => (!e.open ? onClose() : undefined)}>
      <DialogPositioner>
        <DialogBackdrop />
        <DialogContent maxW="1200px" width="95vw">
          <DialogHeader>
            <DialogTitle>Editar campanha</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogBody overflow="visible">
              {loadingCampaign ? (
                <Box py={8} display="flex" justifyContent="center">
                  <Spinner size="lg" />
                </Box>
              ) : loadingTypes ? (
                <Text color="gray.600" py={4}>Carregando tipos…</Text>
              ) : showForm ? (
                <VStack align="stretch" gap={6}>
                  <Box>
                    <Text fontWeight="semibold" color="gray.800" mb={3}>Cabeçalho</Text>
                    <HStack gap={4} flexWrap="wrap">
                      <Controller
                        name="name"
                        control={control}
                        rules={{
                          required: CAMPAIGN_MESSAGES.campaignNameRequired,
                          maxLength: { value: CAMPAIGN_VALIDATION.NAME_MAX_LENGTH, message: CAMPAIGN_MESSAGES.campaignNameMax(CAMPAIGN_VALIDATION.NAME_MAX_LENGTH) },
                        }}
                        render={({ field, fieldState }) => (
                          <FormField label={CAMPAIGN_MESSAGES.campaignName} error={fieldState.error?.message} htmlFor="edit-name">
                            <Input id="edit-name" {...field} size="sm" maxLength={CAMPAIGN_VALIDATION.NAME_MAX_LENGTH + 1} />
                          </FormField>
                        )}
                      />
                      <Controller
                        name="exp_date"
                        control={control}
                        rules={{ validate: (v) => isValidDateString(typeof v === "string" ? v : "") || CAMPAIGN_MESSAGES.expDateInvalid }}
                        render={({ field, fieldState }) => (
                          <FormField label={CAMPAIGN_MESSAGES.expDate} error={fieldState.error?.message} htmlFor="edit-exp">
                            <Input id="edit-exp" type="date" {...field} size="sm" />
                          </FormField>
                        )}
                      />
                      <Controller
                        name="uf"
                        control={control}
                        render={({ field: ufField }) => (
                          <Controller
                            name="city"
                            control={control}
                            rules={{
                              validate: async () =>
                                validateCampaignCityUfEdit(getValues("city"), getValues("uf"), {
                                  city: fullCampaign?.city ?? null,
                                  uf: fullCampaign?.uf ?? null,
                                }),
                            }}
                            render={({ field: cityField, fieldState }) => (
                              <FormField
                                label={CAMPAIGN_MESSAGES.locationComboLabel}
                                error={fieldState.error?.message}
                                htmlFor="edit-city"
                              >
                                <CityUfCombobox
                                  id="edit-city"
                                  city={cityField.value}
                                  uf={ufField.value}
                                  onChange={(v) => {
                                    cityField.onChange(v.city);
                                    ufField.onChange(v.uf);
                                    void trigger("city");
                                  }}
                                  onBlur={() => {
                                    cityField.onBlur();
                                    ufField.onBlur();
                                  }}
                                  allowUnlisted={
                                    fullCampaign != null
                                      ? {
                                          city: fullCampaign.city ?? "",
                                          uf: fullCampaign.uf ?? "",
                                        }
                                      : null
                                  }
                                />
                              </FormField>
                            )}
                          />
                        )}
                      />
                      <Controller
                        name="lat"
                        control={control}
                        rules={{
                          required: "Latitude é obrigatória",
                          validate: (v) => validateCampaignLatLong(v, "lat"),
                        }}
                        render={({ field, fieldState }) => (
                          <FormField label="Latitude" error={fieldState.error?.message} htmlFor="edit-lat">
                            <Input
                              id="edit-lat"
                              type="number"
                              step="any"
                              {...field}
                              value={String(field.value ?? "")}
                              size="sm"
                              min={CAMPAIGN_VALIDATION.ITEM_LAT_MIN}
                              max={CAMPAIGN_VALIDATION.ITEM_LAT_MAX}
                            />
                          </FormField>
                        )}
                      />
                      <Controller
                        name="long"
                        control={control}
                        rules={{
                          required: "Longitude é obrigatória",
                          validate: (v) => validateCampaignLatLong(v, "long"),
                        }}
                        render={({ field, fieldState }) => (
                          <FormField label="Longitude" error={fieldState.error?.message} htmlFor="edit-long">
                            <Input
                              id="edit-long"
                              type="number"
                              step="any"
                              {...field}
                              value={String(field.value ?? "")}
                              size="sm"
                              min={CAMPAIGN_VALIDATION.ITEM_LONG_MIN}
                              max={CAMPAIGN_VALIDATION.ITEM_LONG_MAX}
                            />
                          </FormField>
                        )}
                      />
                      <Controller
                        name="radius"
                        control={control}
                        rules={{
                          required: "Raio é obrigatório",
                          validate: validateCampaignRadius,
                        }}
                        render={({ field, fieldState }) => (
                          <FormField label={CAMPAIGN_MESSAGES.colRadius} error={fieldState.error?.message} htmlFor="edit-radius">
                            <Input
                              id="edit-radius"
                              type="number"
                              {...field}
                              value={String(field.value ?? "")}
                              size="sm"
                              min={CAMPAIGN_VALIDATION.RADIUS_MIN}
                              max={CAMPAIGN_VALIDATION.RADIUS_MAX}
                            />
                          </FormField>
                        )}
                      />
                      <Controller
                        name="enabled"
                        control={control}
                        render={({ field }) => (
                          <Checkbox.Root
                            id="edit-enabled"
                            checked={field.value}
                            onCheckedChange={(e) => field.onChange(Boolean(e.checked))}
                            alignSelf="flex-start"
                            width="fit-content"
                            maxW="100%"
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>{CAMPAIGN_MESSAGES.active}</Checkbox.Label>
                          </Checkbox.Root>
                        )}
                      />
                    </HStack>
                  </Box>
                  <HStack gap={4} align="flex-start" flexWrap="wrap" width="100%">
                    {fullCampaign.enter && (
                      <EditItemSection kind="enter" control={control} />
                    )}
                    {fullCampaign.dwell && (
                      <EditItemSection kind="dwell" control={control} />
                    )}
                    {fullCampaign.exit && (
                      <EditItemSection kind="exit" control={control} />
                    )}
                  </HStack>
                  {!fullCampaign.enter && !fullCampaign.dwell && !fullCampaign.exit && (
                    <Text color="gray.500" fontSize="sm">Nenhum item cadastrado. Adicione itens pela API se necessário.</Text>
                  )}
                </VStack>
              ) : null}
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} minW="100px">
                {CAMPAIGN_MESSAGES.cancel}
              </Button>
              <Button type="submit" loading={loading} minW="100px" disabled={!showForm || loadingTypes}>
                {CAMPAIGN_MESSAGES.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}

function EditItemSection({
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
            maxLength: { value: CAMPAIGN_VALIDATION.TITLE_MAX_LENGTH, message: CAMPAIGN_MESSAGES.campaignNameMax(CAMPAIGN_VALIDATION.TITLE_MAX_LENGTH) },
          }}
          render={({ field, fieldState }) => (
            <FormField label={CAMPAIGN_MESSAGES.itemTitle} error={fieldState.error?.message} htmlFor={`${prefix}-title`}>
              <Input id={`${prefix}-title`} {...field} value={String(field.value ?? "")} size="sm" maxLength={CAMPAIGN_VALIDATION.TITLE_MAX_LENGTH + 1} />
            </FormField>
          )}
        />
        <Controller
          name={`${prefix}_description` as keyof FormValues}
          control={control}
          rules={{ maxLength: { value: CAMPAIGN_VALIDATION.DESCRIPTION_MAX_LENGTH, message: CAMPAIGN_MESSAGES.itemDescriptionMax(CAMPAIGN_VALIDATION.DESCRIPTION_MAX_LENGTH) } }}
          render={({ field, fieldState }) => (
            <FormField label={CAMPAIGN_MESSAGES.itemDescription} error={fieldState.error?.message} htmlFor={`${prefix}-desc`}>
              <Input id={`${prefix}-desc`} {...field} value={String(field.value ?? "")} placeholder="Opcional" size="sm" maxLength={CAMPAIGN_VALIDATION.DESCRIPTION_MAX_LENGTH + 1} />
            </FormField>
          )}
        />
      </VStack>
    </Box>
  );
}
