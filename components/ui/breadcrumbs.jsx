"use client";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs({ items, className = "" }) {
    return (
        <nav aria-label="Breadcrumb" className={`flex items-center mb-6 ${className}`}>
            <ol className="flex items-center flex-wrap gap-2 text-sm text-slate-500 leading-none">
                <li className="flex items-center">
                    <Link
                        href="/"
                        className="inline-flex items-center hover:text-[#00C2C0] transition-colors"
                    >
                        <Home className="w-4 h-4 mr-1.5" />
                        <span>Home</span>
                    </Link>
                </li>

                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <div className="ml-2">
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="hover:text-[#00C2C0] transition-colors whitespace-nowrap inline-flex items-center"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-slate-900 font-medium truncate max-w-[150px] sm:max-w-md inline-block">
                                    {item.label}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
