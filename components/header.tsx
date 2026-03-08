"use client";

import { Icons } from "@/components/ui/icons";

export function Header() {
    return (
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
            <div className="w-full flex-1">
                <form>
                    <div className="relative">
                        <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <input
                            className="w-full bg-white shadow-none appearance-none pl-8 md:w-2/3 lg:w-1/3 rounded-md border border-gray-200 py-2 text-sm outline-none focus:border-blue-500 dark:bg-gray-950 dark:border-gray-800"
                            placeholder="Search patients, appointments..."
                            type="search"
                        />
                    </div>
                </form>
            </div>
            <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Icons.bell className="h-5 w-5 text-gray-500" />
                <span className="sr-only">Notifications</span>
            </button>
        </header>
    );
}
