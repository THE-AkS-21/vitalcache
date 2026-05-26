/**
 * app/page.tsx — Root Page
 *
 * Pure Server Component. No 'use client'. No Zustand. No useEffect.
 *
 * The middleware handles the actual routing:
 * - Has cookie → middleware redirects to /dashboard before this renders
 * - No cookie  → middleware redirects to /login before this renders
 *
 * This page is the fallback for the root "/" path. In practice, users
 * will never see it render because middleware intercepts first.
 * We use a server-side redirect as a belt-and-suspenders safety net.
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function RootPage() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has('refresh_token');

  // Server-side redirect — zero client JavaScript, zero FOUC
  redirect(hasSession ? '/dashboard' : '/login');
}