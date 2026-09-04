import { getPillarsAction, getPillarDiseaseLinksAction } from '@/app/actions/pillarActions';
import { getDiseasesAction } from '@/app/actions/diseaseActions';
import PillarsManagerClient from '@/components/admin/PillarsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminPillarsPage() {
  // Fetch pillars, all diseases, and the pillar -> disease link map from the database
  const [pillars, diseases, pillarDiseaseLinks] = await Promise.all([
    getPillarsAction(),
    getDiseasesAction(),
    getPillarDiseaseLinksAction()
  ]);

  return (
    <PillarsManagerClient
      initialPillars={pillars}
      diseases={diseases}
      pillarDiseaseLinks={pillarDiseaseLinks}
    />
  );
}
