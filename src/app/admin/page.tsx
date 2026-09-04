import { redirect } from 'next/navigation';
import { checkAuth } from '@/app/actions/authActions';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const isAuthorized = await checkAuth();
  if (isAuthorized) {
    redirect('/admin/dashboard');
  } else {
    redirect('/admin/login');
  }
}
