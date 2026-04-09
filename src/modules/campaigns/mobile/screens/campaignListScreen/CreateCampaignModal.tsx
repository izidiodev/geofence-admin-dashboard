import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
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
} from "@chakra-ui/react";
import { campaignController } from "@modules/campaigns/business";
import {
  isValidDateString,
  validateCampaignLatLong,
  validateCampaignRadius,
} from "@modules/campaigns/constants/campaignValidation";
import { validateCampaignCityUfCreate } from "@modules/campaigns/constants/campaignLocationValidation";
import type { CreateCampaignDTO } from "@/types/campaign";
import { showApiResultSnackbar } from "@/utils/showApiResultSnackbar";
import { FormField } from "@/DS/FormField/FormField";
import { CityUfCombobox } from "@/DS/CityUfCombobox/CityUfCombobox";
import { CAMPAIGN_MESSAGES } from "@/constants/messages";
import { CAMPAIGN_VALIDATION } from "@modules/campaigns/constants/campaignValidation";

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (campaignId: string, campaignName: string) => void;
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
}

const defaultValues: FormValues = {
  name: "",
  exp_date: "",
  city: "",
  uf: "",
  lat: "",
  long: "",
  radius: "",
  enabled: true,
};

export function CreateCampaignModal({
  open,
  onClose,
  onSuccess,
}: CreateCampaignModalProps): React.ReactNode {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, reset, getValues, trigger } = useForm<FormValues>({ defaultValues });

  const onSubmit = async (values: FormValues): Promise<void> => {
    setLoading(true);
    const dto: CreateCampaignDTO = {
      name: values.name.trim(),
      exp_date: values.exp_date.trim(),
      city: values.city.trim(),
      uf: values.uf.trim().toUpperCase(),
      lat: Number(values.lat),
      long: Number(values.long),
      radius: Math.round(Number(values.radius)),
      enabled: values.enabled,
    };
    const result = await campaignController.create(dto);
    setLoading(false);
    showApiResultSnackbar(result, { successMessage: CAMPAIGN_MESSAGES.campaignCreated });
    if (result.success && result.data) {
      reset(defaultValues);
      onClose();
      onSuccess(result.data.id, result.data.name);
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={(e) => (!e.open ? onClose() : undefined)}>
      <DialogPositioner>
        <DialogBackdrop />
        <DialogContent maxW="480px">
          <DialogHeader>
            <DialogTitle>{CAMPAIGN_MESSAGES.createCampaignHeaderTitle}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogBody overflow="visible">
              <Text color="gray.600" mb={4} fontSize="sm">
                {CAMPAIGN_MESSAGES.createCampaignHeaderSubtitle}
              </Text>
              <VStack align="stretch" gap={3}>
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: CAMPAIGN_MESSAGES.campaignNameRequired,
                    maxLength: {
                      value: CAMPAIGN_VALIDATION.NAME_MAX_LENGTH,
                      message: CAMPAIGN_MESSAGES.campaignNameMax(CAMPAIGN_VALIDATION.NAME_MAX_LENGTH),
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <FormField label={CAMPAIGN_MESSAGES.campaignName} error={fieldState.error?.message} htmlFor="create-name">
                      <Input id="create-name" {...field} size="sm" maxLength={CAMPAIGN_VALIDATION.NAME_MAX_LENGTH + 1} />
                    </FormField>
                  )}
                />
                <Controller
                  name="exp_date"
                  control={control}
                  rules={{
                    required: CAMPAIGN_MESSAGES.expDateRequired,
                    validate: (v) => {
                      const s = typeof v === "string" ? v.trim() : "";
                      if (!s) return CAMPAIGN_MESSAGES.expDateRequired;
                      return isValidDateString(s) || CAMPAIGN_MESSAGES.expDateInvalid;
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <FormField label={CAMPAIGN_MESSAGES.expDate} error={fieldState.error?.message} htmlFor="create-exp">
                      <Input id="create-exp" type="date" {...field} size="sm" />
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
                          validateCampaignCityUfCreate(getValues("city"), getValues("uf")),
                      }}
                      render={({ field: cityField, fieldState }) => (
                        <FormField
                          label={CAMPAIGN_MESSAGES.locationComboLabel}
                          error={fieldState.error?.message}
                          htmlFor="create-city"
                        >
                          <CityUfCombobox
                            id="create-city"
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
                    <FormField label="Latitude" error={fieldState.error?.message} htmlFor="create-lat">
                      <Input
                        id="create-lat"
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
                  name="long"
                  control={control}
                  rules={{
                    required: "Longitude é obrigatória",
                    validate: (v) => validateCampaignLatLong(v, "long"),
                  }}
                  render={({ field, fieldState }) => (
                    <FormField label="Longitude" error={fieldState.error?.message} htmlFor="create-long">
                      <Input
                        id="create-long"
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
                  name="radius"
                  control={control}
                  rules={{
                    required: "Raio é obrigatório",
                    validate: validateCampaignRadius,
                  }}
                  render={({ field, fieldState }) => (
                    <FormField label={CAMPAIGN_MESSAGES.colRadius} error={fieldState.error?.message} htmlFor="create-radius">
                      <Input
                        id="create-radius"
                        type="number"
                        {...field}
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
                      id="create-enabled"
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
              </VStack>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} minW="100px">
                {CAMPAIGN_MESSAGES.cancel}
              </Button>
              <Button type="submit" loading={loading} minW="120px">
                {CAMPAIGN_MESSAGES.create}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
