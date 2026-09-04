import { redirect } from 'next/navigation';
import { checkAuth } from '@/app/actions/authActions';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  // If already authorized, redirect directly to dashboard
  const isAuthorized = await checkAuth();
  if (isAuthorized) {
    redirect('/admin/dashboard');
  }

  return <LoginForm />;
}
