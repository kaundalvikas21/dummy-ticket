"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Calendar,
  CheckCircle2,
  Briefcase,
} from "lucide-react";

export function RegisterAgencyForm() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [formData, setFormData] = useState({
    // Agency Information
    agencyName: "",
    businessOwner: "",
    typeOfBusiness: "",
    registrationNumber: "",
    website: "",

    // Contact Person
    contactName: "",
    contactEmail: "",
    contactPhone: "",

    // Business Address
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",

    // Business Details
    yearsInBusiness: "",

    // Services Offered
    services: {
      dummyTickets: false,
      hotelBooking: false,
      visaAssistance: false,
      travelInsurance: false,
      flightBooking: false,
      tourPackages: false,
    },

    // Additional Information
    additionalInfo: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("[v0] Agency registration submitted:", formData);
    // Handle form submission
  };

  const handleServiceToggle = (service) => {
    setFormData({
      ...formData,
      services: {
        ...formData.services,
        [service]: !formData.services[service],
      },
    });
  };

  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Netherlands",
    "Belgium",
    "Switzerland",
    "Austria",
    "Sweden",
    "Norway",
    "Denmark",
    "Finland",
    "India",
    "China",
    "Japan",
    "South Korea",
    "Singapore",
    "Malaysia",
    "Thailand",
    "Indonesia",
    "United Arab Emirates",
    "Saudi Arabia",
    "Qatar",
    "Kuwait",
    "Bahrain",
    "Oman",
    "Brazil",
    "Mexico",
    "Argentina",
    "Chile",
    "Colombia",
    "Peru",
    "South Africa",
    "Nigeria",
    "Kenya",
    "Egypt",
    "Morocco",
    "New Zealand",
    "Ireland",
    "Portugal",
    "Greece",
    "Poland",
    "Czech Republic",
    "Hungary",
    "Turkey",
    "Israel",
    "Philippines",
    "Vietnam",
    "Pakistan",
    "Bangladesh",
  ].sort();

  return (
    <section
      ref={ref}
      className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-3xl p-5 md:p-8 lg:p-10 shadow-lg border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              {/* Agency Information */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                  <Building2 className="w-5 h-5 md:w-6 md:h-6 text-[#0066FF]" />
                  Agency Information
                </h2>

                <div className="space-y-4 md:space-y-5">
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                      Agency Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-400">
                        <Building2 className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <input
                        type="text"
                        value={formData.agencyName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            agencyName: e.target.value,
                          })
                        }
                        placeholder="Your agency name"
                        className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                        Business Owner Name{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-400">
                          <User className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <input
                          type="text"
                          value={formData.businessOwner}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              businessOwner: e.target.value,
                            })
                          }
                          placeholder="Owner's name"
                          className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                        Type of Business <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-400 z-10">
                          <Briefcase className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <select
                          value={formData.typeOfBusiness}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              typeOfBusiness: e.target.value,
                            })
                          }
                          className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 text-sm md:text-base appearance-none cursor-pointer"
                          required
                        >
                          <option value="">Select business type</option>
                          <option value="travel-agency">Travel Agency</option>
                          <option value="tour-operator">Tour Operator</option>
                          <option value="online-travel-agency">
                            Online Travel Agency (OTA)
                          </option>
                          <option value="visa-consultancy">
                            Visa Consultancy
                          </option>
                          <option value="corporate-travel">
                            Corporate Travel Management
                          </option>
                          <option value="travel-management">
                            Travel Management Company
                          </option>
                          <option value="destination-management">
                            Destination Management Company
                          </option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                        Registration Number{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-400">
                          <FileText className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <input
                          type="text"
                          value={formData.registrationNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              registrationNumber: e.target.value,
                            })
                          }
                          placeholder="Registration number"
                          className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                        Website
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-400">
                          <Globe className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              website: e.target.value,
                            })
                          }
                          placeholder="https://yourwebsite.com"
                          className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 md:w-6 md:h-6 text-[#0066FF]" />
                  Contact Person
                </h2>

                <div className="space-y-4 md:space-y-5">
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <input
                        type="text"
                        value={formData.contactName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactName: e.target.value,
                          })
                        }
                        placeholder="Contact person name"
                        className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-400">
                          <Mail className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <input
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contactEmail: e.target.value,
                            })
                          }
                          placeholder="email@example.com"
                          className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-400">
                          <Phone className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <input
                          type="tel"
                          value={formData.contactPhone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contactPhone: e.target.value,
                            })
                          }
                          placeholder="+1 234 567 8900"
                          className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Address */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-[#0066FF]" />
                  Business Address
                </h2>

                <div className="space-y-4 md:space-y-5">
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                      placeholder="Street address"
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="City"
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                        State/Province <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        placeholder="State/Province"
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-400 z-10">
                          <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <select
                          value={formData.country}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              country: e.target.value,
                            })
                          }
                          className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 text-sm md:text-base appearance-none cursor-pointer"
                          required
                        >
                          <option value="">Select country</option>
                          {countries.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            postalCode: e.target.value,
                          })
                        }
                        placeholder="Postal code"
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-[#0066FF]" />
                  Business Details
                </h2>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                    Years in Business <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-400">
                      <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={formData.yearsInBusiness}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          yearsInBusiness: e.target.value,
                        })
                      }
                      placeholder="Years"
                      className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Services Offered */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#0066FF]" />
                  Services You Offer
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {[
                    { key: "dummyTickets", label: "Dummy Tickets" },
                    { key: "hotelBooking", label: "Hotel Booking" },
                    { key: "visaAssistance", label: "Visa Assistance" },
                    { key: "travelInsurance", label: "Travel Insurance" },
                    { key: "flightBooking", label: "Flight Booking" },
                    { key: "tourPackages", label: "Tour Packages" },
                  ].map((service) => (
                    <button
                      key={service.key}
                      type="button"
                      onClick={() => handleServiceToggle(service.key)}
                      className={`p-3 md:p-4 rounded-xl border-2 transition-all text-left ${
                        formData.services[service.key]
                          ? "border-[#0066FF] bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div
                          className={`w-5 h-5 md:w-6 md:h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                            formData.services[service.key]
                              ? "border-[#0066FF] bg-[#0066FF]"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.services[service.key] && (
                            <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-white" />
                          )}
                        </div>
                        <span className="text-sm md:text-base font-medium text-gray-900">
                          {service.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  Additional Information
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, additionalInfo: e.target.value })
                  }
                  rows={5}
                  placeholder="Tell us more about your agency and why you'd like to partner with us..."
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all resize-none text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 md:pt-6">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white py-3 md:py-4 rounded-xl text-sm md:text-base font-semibold hover:shadow-lg hover:shadow-[#0066FF]/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  Submit Registration
                </Button>

                <p className="text-xs md:text-sm text-gray-500 text-center mt-4">
                  By submitting this form, you agree to our terms and conditions
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
