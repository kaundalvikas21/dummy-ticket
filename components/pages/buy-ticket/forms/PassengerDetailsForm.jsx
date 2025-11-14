"use client";

import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { TextInput } from "@/components/ui/input/TextInput";
import { SelectInput } from "@/components/ui/input/SelectInput";
import { DatePicker } from "@/components/ui/input/DatePicker";
import { useTranslation } from "@/lib/translations";

export function PassengerDetailsForm({ formData, updateFormData }) {
  const { t } = useTranslation()

  const genderOptions = [
    { value: "male", label: t('buyTicket.passengerDetails.genders.male') },
    { value: "female", label: t('buyTicket.passengerDetails.genders.female') },
    { value: "other", label: t('buyTicket.passengerDetails.genders.other') },
  ];

  const nationalityOptions = [
    { value: "US", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "CA", label: "Canada" },
    { value: "AU", label: "Australia" },
    { value: "IN", label: "India" },
    { value: "DE", label: "Germany" },
    { value: "FR", label: "France" },
    { value: "IT", label: "Italy" },
    { value: "ES", label: "Spain" },
    { value: "JP", label: "Japan" },
    { value: "CN", label: "China" },
    { value: "SG", label: "Singapore" },
    { value: "AE", label: "United Arab Emirates" },
    { value: "SA", label: "Saudi Arabia" },
    { value: "NZ", label: "New Zealand" },
    { value: "KR", label: "South Korea" },
    { value: "BR", label: "Brazil" },
    { value: "ZA", label: "South Africa" },
    { value: "MX", label: "Mexico" },
    { value: "TH", label: "Thailand" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{t('buyTicket.passengerDetails.title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('buyTicket.passengerDetails.description')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          icon={User}
          label={t('buyTicket.passengerDetails.fields.firstName')}
          value={formData.firstName}
          onChange={(value) => updateFormData("firstName", value)}
          placeholder={t('buyTicket.passengerDetails.placeholders.firstName')}
          required
        />

        <TextInput
          icon={User}
          label={t('buyTicket.passengerDetails.fields.lastName')}
          value={formData.lastName}
          onChange={(value) => updateFormData("lastName", value)}
          placeholder={t('buyTicket.passengerDetails.placeholders.lastName')}
          required
        />

        <TextInput
          icon={Mail}
          label={t('buyTicket.passengerDetails.fields.email')}
          type="email"
          value={formData.email}
          onChange={(value) => updateFormData("email", value)}
          placeholder={t('buyTicket.passengerDetails.placeholders.email')}
          required
        />

        <TextInput
          icon={Phone}
          label={t('buyTicket.passengerDetails.fields.phone')}
          type="tel"
          value={formData.phone}
          onChange={(value) => updateFormData("phone", value)}
          placeholder={t('buyTicket.passengerDetails.placeholders.phone')}
          required
        />

        <TextInput
          icon={MapPin}
          label={t('buyTicket.passengerDetails.fields.passportNumber')}
          value={formData.passportNumber}
          onChange={(value) => updateFormData("passportNumber", value)}
          placeholder={t('buyTicket.passengerDetails.placeholders.passportNumber')}
          required
        />

        <DatePicker
          label={t('buyTicket.passengerDetails.fields.dateOfBirth')}
          value={formData.dateOfBirth}
          onChange={(value) => updateFormData("dateOfBirth", value)}
          placeholder={t('buyTicket.passengerDetails.placeholders.selectDateOfBirth')}
          required
          disabledDate={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
        />

        <SelectInput
          icon={User}
          label={t('buyTicket.passengerDetails.fields.gender')}
          value={formData.gender}
          onChange={(value) => updateFormData("gender", value)}
          options={genderOptions}
          placeholder={t('buyTicket.passengerDetails.placeholders.selectGender')}
          required
        />
        <SelectInput
          icon={MapPin}
          label={t('buyTicket.passengerDetails.fields.nationality')}
          value={formData.nationality}
          onChange={(value) => updateFormData("nationality", value)}
          options={nationalityOptions}
          placeholder={t('buyTicket.passengerDetails.placeholders.selectNationality')}
          required
        />
      </div>
    </motion.div>
  );
}
