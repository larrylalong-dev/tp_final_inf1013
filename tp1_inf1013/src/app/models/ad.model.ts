export interface Ad {
  id: string | number;
  title: string;
  shortDescription: string;
  longDescription: string;
  monthlyRent: number;
  availableFrom: string;
  photos: string[];
  locationAddress: string;
  street?: string;
  city?: string;
  postalCode?: string;
  streetAddress?: string;
  location?: {
    lat?: number;
    lng?: number;
  };
  ownerId: string;
  isActive: boolean;
  views: number;
}
