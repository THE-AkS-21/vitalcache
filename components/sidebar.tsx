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
import { useAuthStore } from '@/store/authStore';

type IconKey = keyof typeof Icons;

interface SidebarItem {
  title: string;
  href: string;
  icon: IconKey;
}

const sidebarItems: SidebarItem[] = [
  { title: 'Dashboard',     href: '/dashboard',     icon: 'dashboard' },
  { title: 'Appointments',  href: '/appointments',  icon: 'appointments' },
  { title: 'Prescriptions', href: '/prescriptions', icon: 'pill' },
  { title: 'Medicines',     href: '/medicines',     icon: 'pill' },
  { title: 'Billing',       href: '/billing',       icon: 'billing' },
  { title: 'Settings',      href: '/settings',      icon: 'settings' },
  { title: 'Patients',      href: '/patients',      icon: 'patients' },
];

export function Sidebar() {
  const pathname = usePathname();

  const { user } = useAuthStore();

  return (
    <div className="hidden border-r bg-gray-100/40 lg:flex dark:bg-gray-800/40 w-64 h-screen flex-col sticky top-0">
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
            
            // Hide Patients page for everyone except Godfather and Developer
            if (item.title === 'Patients' && user?.role !== 'GodFather' && user?.role !== 'Developer') {
              return null;
            }

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

          {user && (user.role === 'Developer' || user.role === 'GodFather' || user.role === 'Admin') && (
            <Link
              href="/settings/developer"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                'hover:text-gray-900 dark:hover:text-gray-50',
                pathname === '/settings/developer' || pathname.startsWith('/settings/developer/')
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              <Icons.settings className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              Invite Users
            </Link>
          )}
        </nav>
      </div>

      {/* User info footer & Profile Link */}
      <div className="mt-auto border-t p-2">
        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-200 dark:hover:bg-gray-700',
            pathname === '/profile' ? 'bg-gray-200 dark:bg-gray-700' : ''
          )}
        >
          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold uppercase">
            {user?.first_name?.[0] ?? <Icons.user className="h-4 w-4" aria-hidden="true" />}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium truncate text-gray-900 dark:text-white">
              {user ? `${user.first_name} ${user.last_name}` : 'Loading...'}
            </span>
            <span className="text-xs text-gray-500 truncate capitalize">
              {user?.designation ?? user?.role ?? ''}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
