"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutDashboard, Bell, ChevronDown } from "lucide-react";

interface SearchBarProps {
    title?: string;
    icon?: React.ReactNode;
}

export default function SearchBar({ title = "Assignment", icon }: SearchBarProps) {
    const router = useRouter();
    const displayIcon = icon ?? <LayoutDashboard size={20} className="text-[#A9A9A9] flex-none" />;

    return (
        <header
            className="flex w-full h-[56px] shrink-0 items-center gap-[10px] rounded-[16px] px-3 pl-6"
            style={{
                background: "rgba(255, 255, 255, 0.75)",
                backdropFilter: "blur(18px)",
                boxSizing: "border-box",
            }}
        >
            <div className="flex items-center gap-3 w-10 h-10 flex-none">
                <button
                    onClick={() => router.back()}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white transition-all hover:bg-[#F5F5F5] active:scale-95 flex-none"
                    aria-label="Go back"
                >
                    <ArrowLeft size={24} className="text-[#303030]" />
                </button>
            </div>

            <div className="flex flex-row items-center gap-2 h-5 flex-none">
                {displayIcon}
                <span
                    className="flex items-center text-[16px] font-semibold leading-[19px] tracking-[-0.04em] text-[#A9A9A9] h-[19px]"
                    style={{ fontFamily: "Bricolage Grotesque" }}
                >
                    {title}
                </span>
            </div>

            <div className="flex-1" />

            <button
                className="relative isolate flex h-9 w-9 items-center justify-center rounded-full bg-[#F6F6F6] transition-all hover:bg-[#EEEEEF] active:scale-95 flex-none"
                aria-label="Notifications"
            >
                <Bell size={20} className="text-[#303030] z-0" />
                <div
                    className="absolute w-2 h-2 rounded-full bg-[#FF5623] z-1"
                    style={{ left: "27px", top: "1px" }}
                />
            </button>

            <button
                className="flex items-center gap-2 rounded-[12px] px-3 py-1.5 h-11 w-[157px] flex-none transition-all hover:scale-[1.02] active:scale-98"
                style={{
                    filter: "drop-shadow(0px 16px 48px rgba(0, 0, 0, 0.12)) drop-shadow(0px 32px 48px rgba(0, 0, 0, 0.2))",
                }}
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F6F6F6] border border-[#EBEBEB] overflow-hidden flex-none">
                    <svg viewBox="0 0 32 32" fill="none" width="32" height="32" className="text-[#A9A9A9]">
                        <circle cx="16" cy="12" r="6" fill="currentColor" />
                        <ellipse cx="16" cy="27" rx="11" ry="8" fill="currentColor" />
                    </svg>
                </div>

                <div className="flex items-center gap-1 w-[93px] h-6 flex-none">
                    <span
                        className="flex items-center text-[16px] font-semibold leading-[19px] tracking-[-0.04em] text-[#303030] h-[19px]"
                        style={{ fontFamily: "Bricolage Grotesque" }}
                    >
                        John Doe
                    </span>
                    <ChevronDown size={24} strokeWidth={1.5} className="text-[#303030]" />
                </div>
            </button>
        </header>
    );
}
