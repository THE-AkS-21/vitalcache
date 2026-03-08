'use client'
import SetWindowToken from '@/app/(auth)/set-window-token'
import { useEffect, useState } from 'react'
import { tokenStore } from '@/lib/auth/token-store'
import { decodeJwt } from 'jose'
import { useRouter } from 'next/navigation'
import QueryProvider from '@/components/shell/query-provider'
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const r = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = tokenStore.get()
    if (!t) { r.replace('/login'); return }
    try { decodeJwt(t); setReady(true) } catch { r.replace('/login') }
  }, [r])

  if (!ready) return null

  return (
    <QueryProvider>
      <SetWindowToken />
      <div className="flex min-h-screen w-full bg-white dark:bg-gray-950">
        <Sidebar />
        <div className="flex flex-col w-full">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 bg-gray-50/50 dark:bg-gray-900/50">
            {children}
          </main>
        </div>
      </div>
    </QueryProvider>
  )
}
