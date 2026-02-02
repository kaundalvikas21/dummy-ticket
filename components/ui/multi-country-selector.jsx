"use client"
import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

// Simple Command-like interface since we don't have the full cmkda/shadcn Command component installed or verified
// We'll build a custom one with valid accessible HTML

export function MultiCountrySelector({
    countries = [],
    selected = [],
    onChange,
    placeholder = "Select countries..."
}) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")

    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.code.toLowerCase().includes(search.toLowerCase())
    )

    const toggleSelection = (code) => {
        if (selected.includes(code)) {
            onChange(selected.filter(c => c !== code))
        } else {
            onChange([...selected, code])
        }
    }

    const handleRemove = (e, code) => {
        e.stopPropagation()
        onChange(selected.filter(c => c !== code))
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between min-h-10 h-auto"
                >
                    <div className="flex flex-wrap gap-1 justify-start">
                        {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
                        {selected.length > 0 && selected.map(code => {
                            const country = countries.find(c => c.code === code)
                            return (
                                <Badge key={code} variant="secondary" className="mr-1 mb-1">
                                    {country?.name || code}
                                    <span
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:bg-slate-300/50"
                                        onClick={(e) => handleRemove(e, code)}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </span>
                                </Badge>
                            )
                        })}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <div className="p-2 border-b">
                    <input
                        type="text"
                        className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Search country..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1">
                    {filteredCountries.length === 0 ? (
                        <div className="py-6 text-center text-sm">No country found.</div>
                    ) : (
                        filteredCountries.map((country) => (
                            <div
                                key={country.code}
                                onClick={() => toggleSelection(country.code)}
                                className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-disabled:pointer-events-none data-disabled:opacity-50 hover:bg-accent hover:text-accent-foreground",
                                    selected.includes(country.code) ? "bg-accent" : ""
                                )}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        selected.includes(country.code) ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {country.name}
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
