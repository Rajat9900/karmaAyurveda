export interface Clinic {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  map_url?: string;
  image?: string;
  video_url?: string;
  tag_ids?: number[]; // parsed array of linked clinic_tags IDs
  tag_names?: string[]; // parsed array of linked clinic_tags names
  created_at?: string;
}

export interface ClinicTag {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
}

export interface ClinicGalleryImage {
  id: number;
  clinic_id: number;
  image: string;
  sort_order: number;
  created_at?: string;
}

export interface ClinicDoctor {
  id: number;
  clinic_id: number;
  name: string;
  designation: string;
  about: string;
  image?: string;
  sort_order: number;
  created_at?: string;
}
