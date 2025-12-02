"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", label: "Journal", icon: Home },
        { href: "/routines", label: "Routines", icon: Dumbbell },
        { href: "/stats", label: "Stats", icon: BarChart2 },
        { href: "/profile", label: "Profil", icon: User },
    ];

    if (pathname === "/" || pathname === "/login" || pathname === "/register") return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 pb-safe bg-black/80">
            <div className="flex justify-around items-center h-16">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
