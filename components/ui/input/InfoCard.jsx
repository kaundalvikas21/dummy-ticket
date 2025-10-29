"use client"

export function InfoCard({ icon: Icon, title, description, variant = "blue" }) {
  const variants = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
  }

  const iconColors = {
    blue: "text-[#0066FF]",
    green: "text-green-600",
  }

  return (
    <div className={`${variants[variant]} border rounded-xl p-4`}>
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 ${iconColors[variant]} flex-shrink-0 mt-0.5`} />
        <div className="text-sm text-gray-700">
          {title && <strong>{title}</strong>}
          {description && <span>{title ? " " : ""}{description}</span>}
        </div>
      </div>
    </div>
  )
}