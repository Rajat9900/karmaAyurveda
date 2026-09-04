import { getPagesAction } from '@/app/actions/pageActions';
import PagesManagerClient from '@/components/admin/PagesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
  // 1. Fetch custom pages from database
  const pages = await getPagesAction();

  return <PagesManagerClient initialPages={pages} />;
}
