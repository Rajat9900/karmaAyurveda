import TreatmentDetailView from '@/components/diseases/TreatmentDetailView';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getDiseaseTreatmentBySlugAction } from '@/app/actions/diseaseTreatmentActions';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for SEO from database
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  // Route params arrive percent-encoded (e.g. Unicode slugs) — decode before using as a lookup key.
  const slug = decodeURIComponent(resolvedParams.slug);
  const treatment = await getDiseaseTreatmentBySlugAction(`therapy/${slug}`);

  if (!treatment) {
    return { title: 'Therapy Detail | Karma Ayurveda Hospital' };
  }

  return {
    title: treatment.meta_title || `${treatment.title} - Karma Ayurveda Hospital`,
    description: treatment.meta_des || `Read about Ayurvedic treatment for ${treatment.title.toLowerCase()} at Karma Ayurveda.`
  };
}

export default async function TherapyDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const treatment = await getDiseaseTreatmentBySlugAction(`therapy/${slug}`);

  if (!treatment) {
    redirect('/all-diseases');
  }

  return <TreatmentDetailView treatment={treatment} />;
}
