"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MapPin, Plane } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import airportData from "@/data/airport.json"

export function AirportSelect({
    label,
    value,
    onChange,
    placeholder,
    required = false,
    icon: Icon = Plane,
    iconClassName = "",
    error
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState(value || "")
    const [filteredAirports, setFilteredAirports] = useState([])
    const dropdownRef = useRef(null)

    // Sync searchQuery with value only when not open (to allow typing)
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery(value || "")
        }
    }, [value, isOpen])

    // Handle filtering
    useEffect(() => {
        if (searchQuery.length < 1) {
            setFilteredAirports([])
            return
        }

        const query = searchQuery.toLowerCase().trim()
        const filtered = airportData.data.filter(airport =>
            airport.city.toLowerCase().includes(query) ||
            airport.name.toLowerCase().includes(query) ||
            airport.code.toLowerCase().includes(query) ||
            airport.country.toLowerCase().includes(query)
        ).slice(0, 10) // Limit to 10 results

        setFilteredAirports(filtered)
    }, [searchQuery])

    // Handle click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
                // Revert search query to actual selected value on blur
                setSearchQuery(value || "")
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [value])

    const handleSelect = (airport) => {
        const displayValue = `${airport.city}, ${airport.country} ${airport.name} - ${airport.code.toUpperCase()}`
        setSearchQuery(displayValue)
        onChange(displayValue)
        setIsOpen(false)
    }

    return (
        <div className="space-y-2 relative" ref={dropdownRef}>
            {label && (
                <Label className="text-xs md:text-sm font-semibold text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
            )}

            <div className="relative">
                {Icon && (
                    <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 z-10 ${iconClassName || ""}`} />
                )}

                <Input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setIsOpen(true)
                        // If user clears the input, update the form value too
                        if (e.target.value === "") {
                            onChange("")
                        }
                    }}
                    placeholder={placeholder}
                    className={`${Icon ? "pl-10 md:pl-11" : ""} ${error ? "border-red-500" : ""} h-11 md:h-12 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-100`}
                    required={required}
                />

                <AnimatePresence>
                    {isOpen && filteredAirports.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-100 overflow-hidden max-h-[400px] overflow-y-auto"
                        >
                            <div className="py-2">
                                {filteredAirports.map((airport, index) => (
                                    <button
                                        key={`${airport.code}-${index}`}
                                        type="button"
                                        onClick={() => handleSelect(airport)}
                                        className="w-full text-left px-4 py-3 hover:bg-blue-50/50 transition-colors border-b border-gray-50 last:border-0 group flex gap-3 items-start"
                                    >
                                        <div className="mt-1 shrink-0">
                                            <Plane className="w-4 h-4 text-gray-400 group-hover:text-[#0066FF] transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-gray-900 group-hover:text-[#0066FF] transition-colors mb-0.5">
                                                {airport.city}, {airport.country}
                                            </div>
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <div className="flex-1 truncate pr-4">
                                                    {airport.name}
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-gray-300">-</span>
                                                    <span className="font-bold text-gray-700 tracking-wider">
                                                        {airport.code.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {error && (
                <p className="text-[14px] text-red-500 mt-1">{error}</p>
            )}
        </div>
    )
}
