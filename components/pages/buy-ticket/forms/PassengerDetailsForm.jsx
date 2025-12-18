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
    { value: "United States", label: "United States" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "Canada", label: "Canada" },
    { value: "Australia", label: "Australia" },
    { value: "India", label: "India" },
    { value: "Germany", label: "Germany" },
    { value: "France", label: "France" },
    { value: "Italy", label: "Italy" },
    { value: "Spain", label: "Spain" },
    { value: "Japan", label: "Japan" },
    { value: "China", label: "China" },
    { value: "Singapore", label: "Singapore" },
    { value: "United Arab Emirates", label: "United Arab Emirates" },
    { value: "Saudi Arabia", label: "Saudi Arabia" },
    { value: "New Zealand", label: "New Zealand" },
    { value: "South Korea", label: "South Korea" },
    { value: "Brazil", label: "Brazil" },
    { value: "South Africa", label: "South Africa" },
    { value: "Mexico", label: "Mexico" },
    { value: "Thailand", label: "Thailand" },
  ];
  const today = new Date();

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
          captionLayout="dropdown"
          fromYear={1900}
          toYear={today.getFullYear()}
          defaultMonth={formData.dateOfBirth ? new Date(formData.dateOfBirth) : today}
          disabledDate={(date) =>
            date > today || date < new Date("1900-01-01")
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
