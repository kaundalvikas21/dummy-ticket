"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle, Mail, Phone, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function UserSupport() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    message: "",
  })
  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    toast({
      title: "Support Ticket Created",
      description: "We'll get back to you within 24 hours.",
    })
    setFormData({ subject: "", category: "", message: "" })
  }

  const handleStartChat = () => {
    setIsChatOpen(true)
    toast({
      title: "Chat Started",
      description: "A support agent will be with you shortly.",
    })
  }

  const faqs = [
    {
      question: "How do I download my dummy ticket?",
      answer:
        "Go to the 'Travel Documents' section in your dashboard. Find your booking and click the 'Download' button next to your ticket.",
    },
    {
      question: "Can I modify my booking after payment?",
      answer:
        "Yes, you can modify certain details of your booking. Please contact our support team with your booking ID, and we'll assist you with the changes.",
    },
    {
      question: "How long does it take to receive my ticket?",
      answer:
        "Tickets are usually generated within 2-4 hours after payment confirmation. You'll receive an email notification when your ticket is ready.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers.",
    },
    {
      question: "Is my dummy ticket valid for visa applications?",
      answer:
        "Yes, our dummy tickets are specifically designed for visa applications and meet all embassy requirements.",
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Support & Help</h2>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Methods */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-gray-600 mb-4">support@dummyticket.com</p>
              <p className="text-xs text-gray-500">Response within 24 hours</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-sm text-gray-600 mb-4">+1 (800) 123-4567</p>
              <p className="text-xs text-gray-500">Mon-Fri, 9AM-6PM EST</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-gray-600 mb-4">Chat with us now</p>
              <Button size="sm" onClick={handleStartChat}>
                Start Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking">Booking Issue</SelectItem>
                    <SelectItem value="payment">Payment Problem</SelectItem>
                    <SelectItem value="document">Document Issue</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Submit Ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
