import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import { AdminDashboard } from '../../components/Admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const supabase = createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/login');

    const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(s => s.trim()) ?? [];
    if (!adminIds.includes(session.user.id)) redirect('/');

    return <AdminDashboard />;
}
