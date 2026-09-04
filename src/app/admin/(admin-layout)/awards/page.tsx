import { getAwardsAction } from '@/app/actions/awardActions';
import AwardsManagerClient from '@/components/admin/AwardsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminAwardsPage() {
  const awards = await getAwardsAction();

  return <AwardsManagerClient initialAwards={awards} />;
}
