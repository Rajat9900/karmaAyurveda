import { getMediaArticlesAction } from '@/app/actions/mediaArticleActions';
import MediaArticlesManagerClient from '@/components/admin/MediaArticlesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminMediaArticlesPage() {
  // 1. Fetch media articles from database
  const articles = await getMediaArticlesAction();

  return <MediaArticlesManagerClient initialArticles={articles} />;
}
