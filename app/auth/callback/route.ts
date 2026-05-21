
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    const supabase = createSupabaseServerClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error('[AUTH_CALLBACK] Code exchange failed:', error.message);
        return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }

    return NextResponse.redirect(new URL(next, request.url));
}
