import { getSiteFaqsAction } from '@/app/actions/siteFaqActions';
import SiteFaqsManagerClient from '@/components/admin/SiteFaqsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminSiteFaqsPage() {
  const faqs = await getSiteFaqsAction();

  return <SiteFaqsManagerClient initialFaqs={faqs} />;
}
