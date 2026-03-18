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
import { CAMPAIGN_VALIDATION, isValidDateString } from "@modules/campaigns/constants/campaignValidation";
import type { CreateCampaignDTO } from "@/types/campaign";
import { showApiResultSnackbar } from "@/utils/showApiResultSnackbar";
import { FormField } from "@/DS/FormField/FormField";
import { CAMPAIGN_MESSAGES } from "@/constants/messages";

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (campaignId: string, campaignName: string) => void;
}

interface FormValues {
  name: string;
  exp_date: string;
  city_uf: string;
  enabled: boolean;
}

const defaultValues: FormValues = {
  name: "",
  exp_date: "",
  city_uf: "",
  enabled: true,
};

export function CreateCampaignModal({
  open,
  onClose,
  onSuccess,
}: CreateCampaignModalProps): React.ReactNode {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, reset } = useForm<FormValues>({ defaultValues });

  const onSubmit = async (values: FormValues): Promise<void> => {
    setLoading(true);
    const dto: CreateCampaignDTO = {
      name: values.name.trim(),
      exp_date: values.exp_date.trim(),
      city_uf: values.city_uf.trim(),
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
            <DialogBody>
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
                  name="city_uf"
                  control={control}
                  rules={{
                    required: CAMPAIGN_MESSAGES.cityUfRequired,
                    validate: (v) => {
                      const s = typeof v === "string" ? v.trim() : "";
                      if (!s) return CAMPAIGN_MESSAGES.cityUfRequired;
                      if (s.length > CAMPAIGN_VALIDATION.CITY_UF_MAX_LENGTH) {
                        return CAMPAIGN_MESSAGES.cityUfMax(CAMPAIGN_VALIDATION.CITY_UF_MAX_LENGTH);
                      }
                      return true;
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <FormField label={CAMPAIGN_MESSAGES.cityUf} error={fieldState.error?.message} htmlFor="create-city">
                      <Input id="create-city" {...field} placeholder="Ex: São Paulo - SP" size="sm" maxLength={CAMPAIGN_VALIDATION.CITY_UF_MAX_LENGTH + 1} />
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
