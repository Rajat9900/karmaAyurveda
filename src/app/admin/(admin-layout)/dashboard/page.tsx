import { getLeadsAction } from '@/app/actions/leadActions';
import { getBlogsAction } from '@/app/actions/blogActions';
import DashboardSummaryClient from '@/components/admin/DashboardSummaryClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // 1. Fetch Initial Database Data
  const [leads, blogs] = await Promise.all([
    getLeadsAction(),
    getBlogsAction()
  ]);

  return <DashboardSummaryClient initialLeads={leads} initialBlogs={blogs} />;
}
