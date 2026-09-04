import { getLeadsAction } from '@/app/actions/leadActions';
import LeadsManagerClient from '@/components/admin/LeadsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage() {
  // 1. Fetch Initial Database Data
  const leads = await getLeadsAction();

  return <LeadsManagerClient initialLeads={leads} />;
}
