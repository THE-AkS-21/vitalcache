import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL('/login', req.url);
  // Force clearing the state client side if needed by redirecting to login with a specific parameter
  url.searchParams.set('cleared', '1');
  
  const response = NextResponse.redirect(url);
  
  // Clear the HttpOnly refresh token cookie
  response.cookies.delete('refresh_token');
  
  return response;
}
