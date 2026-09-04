import { getResearchArticlesAction } from '@/app/actions/researchArticleActions';
import ResearchArticlesManagerClient from '@/components/admin/ResearchArticlesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminResearchArticlesPage() {
  const articles = await getResearchArticlesAction();

  return <ResearchArticlesManagerClient initialArticles={articles} />;
}
