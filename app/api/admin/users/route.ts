import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

async function isAdmin(userId: string): Promise<boolean> {
  const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(s => s.trim()) ?? [];
  return adminIds.includes(userId);
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!await isAdmin(session.user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const adminClient = getAdminClient();
  const { data: profiles, error } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(profiles);
}
