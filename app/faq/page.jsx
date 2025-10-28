"use client"

import { useState } from "react"
import HeroSection from "@/components/pages/faq/HeroSection"
import FaqCategory from "@/components/pages/faq/FaqCategory"
import StillHaveQuestions from "@/components/pages/faq/StillHaveQuestions"


import { HelpCircle, Clock, CreditCard, FileText, Globe } from "lucide-react"

const faqCategories = [
  {
    title: "General Questions",
    icon: HelpCircle,
    faqs: [
      {
        question: "What is a dummy ticket?",
        answer:
          "A dummy ticket is a verifiable flight reservation with a valid PNR (Passenger Name Record) code that can be checked on airline websites. It looks like a regular airline ticket and is specifically designed for visa applications and proof of return requirements. The reservation includes all necessary details like passenger name, flight details, booking reference, and can be verified directly with the airline.",
      },
      {
        question: "Is this a real flight ticket?",
        answer:
          "It is a real flight reservation with a valid PNR code that can be verified on the airline website. However, it is not a confirmed paid ticket. It serves as proof of your travel plans for visa applications and meets all embassy requirements for documentation.",
      },
      {
        question: "Will embassies accept dummy tickets?",
        answer:
          "Yes, most embassies and consulates worldwide accept dummy tickets as proof of travel plans. Our reservations are verifiable and meet the requirements of visa application centers like VFS, BLS, and embassy consular sections. We have successfully served thousands of customers for their visa applications.",
      },
    ],
  },
  {
    title: "Booking & Delivery",
    icon: Clock,
    faqs: [
      {
        question: "How quickly will I receive my ticket?",
        answer:
          "You will receive your dummy ticket via email within 5-10 minutes of completing your payment. In most cases, delivery is instant. The email will contain your flight reservation with a valid PNR code and all necessary documentation for your visa application.",
      },
      {
        question: "How long is the reservation valid?",
        answer:
          "The reservation is typically valid for 2-4 weeks, which is sufficient time for most visa applications. If you need an extension or have a specific validity requirement, please contact our support team before placing your order.",
      },
      {
        question: "Can I make changes to my booking?",
        answer:
          "Yes, you can make changes to your booking details including dates, destinations, and passenger information. We allow up to 2 free modifications within 24 hours of booking. Additional changes may incur a small fee. Contact our support team for assistance.",
      },
    ],
  },
  {
    title: "Payment & Security",
    icon: CreditCard,
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, PayPal, and various local payment methods. All transactions are processed through secure, encrypted payment gateways to ensure your financial information is protected.",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Absolutely. We use industry-standard SSL encryption and PCI-DSS compliant payment processors to ensure your payment information is completely secure. We never store your credit card details on our servers.",
      },
      {
        question: "Do you offer refunds?",
        answer:
          "Due to the instant nature of our service and the costs involved in creating reservations, we generally do not offer refunds once the ticket has been delivered. However, if there's an issue with your reservation or it doesn't meet embassy requirements, please contact our support team immediately.",
      },
    ],
  },
  {
    title: "Visa Applications",
    icon: FileText,
    faqs: [
      {
        question: "What if my visa gets rejected?",
        answer:
          "While we cannot guarantee visa approval (as this depends on the embassy and your application), our dummy tickets are accepted by embassies worldwide and meet all documentation requirements. If you have any issues with the ticket itself, our support team is here to help.",
      },
      {
        question: "Which countries accept dummy tickets?",
        answer:
          "Our dummy tickets are accepted for visa applications to most countries including Schengen countries, USA, UK, Canada, Australia, UAE, and many others. The tickets meet international standards and can be verified on airline websites.",
      },
      {
        question: "Can I use this for onward travel requirements?",
        answer:
          "Yes, our dummy tickets can be used to meet onward travel requirements when entering certain countries that require proof of departure. The reservation is verifiable and shows your intended travel plans.",
      },
    ],
  },
  {
    title: "Technical Support",
    icon: Globe,
    faqs: [
      {
        question: "How do I verify my PNR code?",
        answer:
          "You can verify your PNR code directly on the airline's website. Simply go to the airline's 'Manage Booking' or 'Check PNR Status' section, enter your PNR code and last name, and you'll see your reservation details. We also provide step-by-step verification instructions with your ticket.",
      },
      {
        question: "What if I don't receive my ticket?",
        answer:
          "If you don't receive your ticket within 15 minutes, please check your spam/junk folder first. If it's still not there, contact our 24/7 support team immediately with your order number, and we'll resend it right away.",
      },
      {
        question: "Do you provide customer support?",
        answer:
          "Yes, we provide 24/7 customer support via email, phone, and live chat. Our support team is available to help with any questions about your booking, technical issues, or visa application requirements.",
      },
    ],
  },
]


export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter logic preserved
  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-6 md:space-y-12">
            {filteredCategories.map((category, i) =>
              category.faqs.length > 0 ? (
                <FaqCategory key={i} category={category} index={i} />
              ) : null,
            )}
          </div>
        </div>
      </section>

      <StillHaveQuestions />
    </div>
  )
}
