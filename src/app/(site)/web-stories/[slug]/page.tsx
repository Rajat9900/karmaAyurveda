import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import WebStoryViewer from '@/components/blog/WebStoryViewer';
import { getWebStoryBySlugAction } from '@/app/actions/webStoryActions';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await getWebStoryBySlugAction(slug);

  if (!story) {
    return { title: 'Story Not Found | Karma Ayurveda' };
  }

  return {
    title: story.meta_title || `${story.slug} | Karma Ayurveda`,
    description: story.meta_des || undefined,
    keywords: story.meta_keywords || undefined
  };
}

export default async function WebStoryPage({ params }: PageProps) {
  const { slug } = await params;
  const story = await getWebStoryBySlugAction(slug);

  if (!story) {
    notFound();
  }

  return <WebStoryViewer story={story} />;
}
