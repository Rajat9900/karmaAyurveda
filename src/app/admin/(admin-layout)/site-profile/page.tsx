import { getSiteProfileAction } from '@/app/actions/siteProfileActions';
import SiteProfileManagerClient from '@/components/admin/SiteProfileManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminSiteProfilePage() {
  // 1. Fetch site profile settings
  const profile = await getSiteProfileAction();

  const defaultProfile = profile || {
    id: 1,
    name: '',
    logo: '',
    favicon: '',
    email: '',
    phone: '',
    us_phone: '',
    address: '',
    x_link: '',
    fb_link: '',
    ig_link: '',
    yt_link: '',
    wa_number: '',
    wa_channel: '',
    nabh_logo: '',
    nabh_cert_num: '',
    nabh_duration: '',
    total_hospitals: 0
  };

  return <SiteProfileManagerClient initialProfile={defaultProfile} />;
}
