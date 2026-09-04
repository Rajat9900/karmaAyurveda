import LocationDetailView from '@/components/diseases/LocationDetailView';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getLocationBySlugAction, getLocationsAction } from '@/app/actions/locationActions';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for SEO from database
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = await getLocationBySlugAction(`cancer-hospital/${slug}`);

  if (!location) {
    return { title: 'Ayurvedic Cancer Treatment | Karma Ayurveda Hospital' };
  }

  return {
    title: `${location.title || location.name} - Karma Ayurveda Hospital`,
    description: `Read about Ayurvedic cancer treatment at Karma Ayurveda in ${location.city}.`
  };
}

export default async function CancerHospitalDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const location = await getLocationBySlugAction(`cancer-hospital/${slug}`);

  if (!location) {
    redirect('/our-clinics');
  }

  const allLocations = await getLocationsAction();
  const otherLocations = allLocations.filter(l => l.id !== location.id);

  return <LocationDetailView location={location} otherLocations={otherLocations} />;
}
