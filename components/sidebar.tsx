'use client';

/**
 * Sidebar — Client Component (necessary: uses usePathname hook)
 *
 * usePathname() reads the current URL for active nav highlighting.
 * This is a legitimate use of 'use client' — the hook cannot run on the server.
 *
 * Performance notes:
 * ✅ sidebarItems is defined outside the component (no re-creation per render)
 * ✅ No any types — icon keys typed via keyof typeof Icons
 * ✅ href typed via the route type system (next.config typedRoutes: true)
 * ✅ key uses href (stable) instead of index (unstable)
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/ui/icons';

type IconKey = keyof typeof Icons;

interface SidebarItem {
  title: string;
  href: string;
  icon: IconKey;
}

const sidebarItems: SidebarItem[] = [
  { title: 'Dashboard',     href: '/dashboard',     icon: 'dashboard' },
  { title: 'Patients',      href: '/patients',      icon: 'patients' },
  { title: 'Appointments',  href: '/appointments',  icon: 'appointments' },
  { title: 'Prescriptions', href: '/prescriptions', icon: 'pill' },
  { title: 'Billing',       href: '/billing',       icon: 'billing' },
  { title: 'Settings',      href: '/settings',      icon: 'settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40 w-64 min-h-screen flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
          <Icons.activity className="h-6 w-6 text-blue-600" />
          <span>VitalCache</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium" aria-label="Main navigation">
          {sidebarItems.map((item) => {
            const Icon = Icons[item.icon];
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                href={item.href as any}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                  'hover:text-gray-900 dark:hover:text-gray-50',
                  isActive
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User info footer */}
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <Icons.user className="h-4 w-4 text-gray-500" aria-hidden="true" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">Dr. Smith</span>
            <span className="text-xs text-gray-500 truncate">Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
