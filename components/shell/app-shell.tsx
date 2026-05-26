'use client';

/**
 * AppShell — Client Component (uses usePathname hook)
 *
 * Legacy shell component, preserved for backward compatibility.
 * New code should use the (protected)/layout.tsx + Sidebar + Header
 * Server Component composition pattern instead.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

type IconKey = keyof typeof Icons;

interface NavItemProps {
  href: string;
  label: string;
  icon: IconKey;
}

const NavItem = ({ href, label, icon }: NavItemProps) => {
  const Icon = Icons[icon];
  const path = usePathname();
  const active = path?.startsWith(href) ?? false;

  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      href={href as any}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
        active
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200'
          : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
      )}
    >
      <Icon
        className={cn('h-5 w-5', active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600')}
        aria-hidden="true"
      />
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr] bg-slate-50/50">
      <aside className="h-screen sticky top-0 border-r bg-white/80 backdrop-blur-xl z-50 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
              V
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              VitalCache
            </span>
          </div>

          <nav className="space-y-2" aria-label="Main navigation">
            <NavItem href="/dashboard"     label="Dashboard"    icon="activity"      />
            <NavItem href="/patients"      label="Patients"     icon="patients"      />
            <NavItem href="/prescriptions" label="Prescriptions" icon="pill"         />
            <NavItem href="/medicines"     label="Medicines"    icon="pill"          />
            <NavItem href="/certificates"  label="Certificates" icon="file"         />
            <NavItem href="/bundles"       label="Bundles"      icon="add"           />
            <NavItem href="/settings"      label="Settings"     icon="settings"      />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border">
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
              <Icons.user className="h-5 w-5 text-slate-500" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Dr. Smith</p>
              <p className="text-xs text-muted-foreground truncate">Cardiologist</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex flex-col min-h-screen">
        <div className="flex-1 p-8">
          {children}
        </div>
        <footer className="p-6 text-center text-xs text-muted-foreground border-t bg-white/50 backdrop-blur-sm">
          <p>&copy; {new Date().getFullYear()} VitalCache. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
