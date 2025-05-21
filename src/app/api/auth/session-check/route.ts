import { NextResponse } from 'next/server';
import { auth } from '@auth';

/**
 * Endpoint to check if the user's session is still valid
 * Returns 200 if valid, 401 if not
 * Also returns the latest session data to ensure the client has the most up-to-date information
 */
export async function GET() {
  const session = await auth();
  
  // Set no-cache headers to ensure we always get fresh session data
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { 
        status: 401,
        headers
      }
    );
  }
  
  // Return the session data along with the status
  // This allows the client to update its local session state
  return NextResponse.json(
    { 
      status: 'ok',
      session: {
        user: {
          // Ensure the ID is returned as a string for NextAuth compatibility
          id: String(session.user.id),
          name: session.user.name,
          email: session.user.email,
          timezone: session.user.timezone,
          theme: session.user.theme
        }
      }
    }, 
    { 
      status: 200,
      headers
    }
  );
}
