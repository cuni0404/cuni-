export interface Project {
  id: string;
  title: string;
  role: string;
  client: string;
  year: string;
  videoUrl: string;
  videoFile: string;
  thumbnailUrl: string;
  description: string;
  isFeatured: boolean;
  category: string;
  images?: { id: string; imageUrl: string }[];
  createdAt?: any;
  updatedAt?: any;
}

export interface SiteSettings {
  logoText: string;
  logoImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroVideo: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutProfileImage: string;
  aboutDescFontSize: string;
  aboutDescFontWeight: string;
  aboutBackgroundImage: string;
  contactEmail: string;
  contactInstagram: string;
  contactX: string;
  contactYoutube: string;
  clients: string;
}

export type ProjectInput = Omit<Project, 'id' | 'images'> & {
  images: string[];
};
