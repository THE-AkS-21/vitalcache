'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { tokenStore } from '@/lib/auth/token-store'

export default function Home() {
  const r = useRouter()
  useEffect(() => {
    const t = tokenStore.get()
    r.replace(t ? '/dashboard' : '/login')
  }, [r])
  return null
}
