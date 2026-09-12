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
  const resolvedParams = await params;
  // Route params arrive percent-encoded (e.g. Unicode slugs) — decode before using as a lookup key.
  const slug = decodeURIComponent(resolvedParams.slug);
  const location = await getLocationBySlugAction(slug);

  if (!location) {
    return { title: 'Our Clinics | Karma Ayurveda Hospital' };
  }

  return {
    title: `${location.title || location.name} - Karma Ayurveda Hospital`,
    description: `Read about Karma Ayurveda's Ayurvedic hospital branch in ${location.city}.`
  };
}

export default async function OurClinicsLocationDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const location = await getLocationBySlugAction(slug);

  if (!location) {
    redirect('/our-clinics');
  }

  const allLocations = await getLocationsAction();
  const otherLocations = allLocations.filter(l => l.id !== location.id);

  return <LocationDetailView location={location} otherLocations={otherLocations} />;
}
