export function useFormValidation(currentStep, formData) {
  const isStepValid = () => {
    switch (currentStep) {
      case 1: // Select Plan
        return formData.selectedPlan !== ""

      case 2: // Passenger Details
        return (
          formData.firstName.trim() !== "" &&
          formData.lastName.trim() !== "" &&
          formData.email.trim() !== "" &&
          formData.phone.trim() !== "" &&
          formData.passportNumber.trim() !== "" &&
          formData.dateOfBirth.trim() !== "" &&
          formData.gender.trim() !== "" &&
          formData.nationality.trim() !== ""
        )

      case 3: // Travel Details
        return (
          formData.departureCity.trim() !== "" &&
          formData.arrivalCity.trim() !== "" &&
          formData.departureDate.trim() !== "" &&
          (formData.tripType === "one-way" || formData.returnDate.trim() !== "")
        )

      case 4: // Delivery Options
        return formData.deliveryMethod === "whatsapp"
          ? formData.whatsappNumber.trim() !== ""
          : formData.deliveryEmail.trim() !== ""

      case 5: // Billing & Payment
        return (
          formData.billingName.trim() !== "" &&
          formData.billingAddress.trim() !== "" &&
          formData.billingCity.trim() !== "" &&
          formData.billingZip.trim() !== "" &&
          formData.billingCountry.trim() !== ""
        )

      default:
        return true
    }
  }

  return { isStepValid }
}