"use client";

import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { TextInput } from "@/components/ui/input/TextInput";
import { SelectInput } from "@/components/ui/input/SelectInput";
import { DatePicker } from "@/components/ui/input/DatePicker";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
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

export function PassengerDetailsForm({ formData, updateFormData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Passenger Details</h2>
        <p className="text-sm text-muted-foreground">
          Enter the passenger information as it appears on the passport
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          icon={User}
          label="First Name"
          value={formData.firstName}
          onChange={(value) => updateFormData("firstName", value)}
          placeholder="John"
          required
        />

        <TextInput
          icon={User}
          label="Last Name"
          value={formData.lastName}
          onChange={(value) => updateFormData("lastName", value)}
          placeholder="Doe"
          required
        />

        <TextInput
          icon={Mail}
          label="Email"
          type="email"
          value={formData.email}
          onChange={(value) => updateFormData("email", value)}
          placeholder="john.doe@example.com"
          required
        />

        <TextInput
          icon={Phone}
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(value) => updateFormData("phone", value)}
          placeholder="+1 234 567 8900"
          required
        />

        <TextInput
          icon={MapPin}
          label="Passport Number"
          value={formData.passportNumber}
          onChange={(value) => updateFormData("passportNumber", value)}
          placeholder="A12345678"
          required
        />

        <DatePicker
          label="Date of Birth"
          value={formData.dateOfBirth}
          onChange={(value) => updateFormData("dateOfBirth", value)}
          placeholder="Select date of birth"
          required
          disabledDate={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
        />

        <SelectInput
          icon={User}
          label="Gender"
          value={formData.gender}
          onChange={(value) => updateFormData("gender", value)}
          options={genderOptions}
          placeholder="Select gender"
          required
        />
        <SelectInput
          icon={MapPin}
          label="Nationality"
          value={formData.nationality}
          onChange={(value) => updateFormData("nationality", value)}
          options={nationalityOptions}
          placeholder="Select nationality"
          required
        />
      </div>
    </motion.div>
  );
}
