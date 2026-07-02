import {
  Landmark,
  Mail,
  Smartphone,
  Laptop,
  TrendingUp,
  Globe,
  KeyRound,
  Shield,
  Home,
  FileText,
  Eye,
  LifeBuoy,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryStyle {
  label: string;
  icon: LucideIcon;
  /** Small pill badge (soft bg + deep text) */
  badgeClasses: string;
  /** Square pastel icon tile (soft bg + deep icon) */
  tileClasses: string;
}

export const PASSWORD_CATEGORIES: Record<string, CategoryStyle> = {
  bank: {
    label: 'Bank',
    icon: Landmark,
    badgeClasses: 'bg-leaf-soft text-leaf-deep',
    tileClasses: 'bg-leaf-soft text-leaf-deep',
  },
  email: {
    label: 'Email',
    icon: Mail,
    badgeClasses: 'bg-sky-soft text-sky-deep',
    tileClasses: 'bg-sky-soft text-sky-deep',
  },
  phone: {
    label: 'Phone',
    icon: Smartphone,
    badgeClasses: 'bg-plum-soft text-plum-deep',
    tileClasses: 'bg-plum-soft text-plum-deep',
  },
  laptop: {
    label: 'Laptop',
    icon: Laptop,
    badgeClasses: 'bg-cream-deep text-ink-soft',
    tileClasses: 'bg-cream-deep text-ink-soft',
  },
  investment: {
    label: 'Investment',
    icon: TrendingUp,
    badgeClasses: 'bg-sun-soft text-sun-deep',
    tileClasses: 'bg-sun-soft text-sun-deep',
  },
  google: {
    label: 'Google',
    icon: Globe,
    badgeClasses: 'bg-coral-soft text-coral-deep',
    tileClasses: 'bg-coral-soft text-coral-deep',
  },
  other: {
    label: 'Other',
    icon: KeyRound,
    badgeClasses: 'bg-primary-soft text-primary-deep',
    tileClasses: 'bg-primary-soft text-primary-deep',
  },
};

export const DOCUMENT_CATEGORIES: Record<string, CategoryStyle> = {
  investment: {
    label: 'Investment',
    icon: TrendingUp,
    badgeClasses: 'bg-sun-soft text-sun-deep',
    tileClasses: 'bg-sun-soft text-sun-deep',
  },
  insurance: {
    label: 'Insurance',
    icon: Shield,
    badgeClasses: 'bg-sky-soft text-sky-deep',
    tileClasses: 'bg-sky-soft text-sky-deep',
  },
  house: {
    label: 'House',
    icon: Home,
    badgeClasses: 'bg-leaf-soft text-leaf-deep',
    tileClasses: 'bg-leaf-soft text-leaf-deep',
  },
  other: {
    label: 'Other',
    icon: FileText,
    badgeClasses: 'bg-primary-soft text-primary-deep',
    tileClasses: 'bg-primary-soft text-primary-deep',
  },
};

export const ACCESS_LEVELS: Record<string, CategoryStyle> = {
  full: {
    label: 'Full access',
    icon: KeyRound,
    badgeClasses: 'bg-coral-soft text-coral-deep',
    tileClasses: 'bg-coral-soft text-coral-deep',
  },
  'view-only': {
    label: 'View only',
    icon: Eye,
    badgeClasses: 'bg-sun-soft text-sun-deep',
    tileClasses: 'bg-sun-soft text-sun-deep',
  },
  'emergency-only': {
    label: 'Emergency only',
    icon: LifeBuoy,
    badgeClasses: 'bg-leaf-soft text-leaf-deep',
    tileClasses: 'bg-leaf-soft text-leaf-deep',
  },
};

export function passwordCategory(key: string): CategoryStyle {
  return PASSWORD_CATEGORIES[key] || PASSWORD_CATEGORIES.other;
}

export function documentCategory(key: string): CategoryStyle {
  return DOCUMENT_CATEGORIES[key] || DOCUMENT_CATEGORIES.other;
}

export function accessLevel(key: string): CategoryStyle {
  return ACCESS_LEVELS[key] || ACCESS_LEVELS['emergency-only'];
}
