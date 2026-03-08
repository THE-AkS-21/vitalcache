"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: "dashboard",
    },
    {
        title: "Patients",
        href: "/patients",
        icon: "patients",
    },
    {
        title: "Appointments",
        href: "/appointments",
        icon: "appointments",
    },
    {
        title: "Prescriptions",
        href: "/prescriptions",
        icon: "pill",
    },
    {
        title: "Billing",
        href: "/billing",
        icon: "billing",
    },
    {
        title: "Settings",
        href: "/settings",
        icon: "settings",
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40 w-64 min-h-screen flex-col">
            <div className="flex h-14 items-center border-b px-6">
                <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
                    <Icons.activity className="h-6 w-6 text-blue-600" />
                    <span className="">VitalCache</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {sidebarItems.map((item, index) => {
                        const Icon = Icons[item.icon as keyof typeof Icons];
                        return (
                            <Link
                                key={index}
                                href={item.href as any}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-gray-900 dark:hover:text-gray-50",
                                    pathname === item.href
                                        ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                                        : "text-gray-500 dark:text-gray-400"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Icons.user className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">Dr. Smith</span>
                        <span className="text-xs text-gray-500">Admin</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
