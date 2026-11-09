export interface PortfolioItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon?: string;
  image?: string;
  contentImage?: { src: string; alt: string };
  tags?: string[];
  links?: { label: string; url: string }[];
  relatedProjects?: string[];
  children?: PortfolioItem[];
  game?: "doom";
  hide?: boolean;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  items: PortfolioItem[];
}
