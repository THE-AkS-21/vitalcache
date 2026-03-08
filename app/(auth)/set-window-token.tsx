'use client'
import { useEffect } from 'react'
import { tokenStore } from '@/lib/auth/token-store'

export default function SetWindowToken() {
  useEffect(() => {
    ;(window as any).__at = tokenStore.get()
  })
  return null
}
