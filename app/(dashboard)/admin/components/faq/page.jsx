"use client"

import { useState, useEffect } from 'react'
import { FAQManagement } from '@/components/dashboard/admin/faq-management'

export default function FAQPage() {
  return (
    <div className="p-6">
      <FAQManagement />
    </div>
  )
}