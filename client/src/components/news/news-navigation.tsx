interface NewsNavigationProps {
  activeCategory: 'home' | 'music' | 'guides' | 'industry' | 'gigs';
  onCategoryChange: (category: 'home' | 'music' | 'guides' | 'industry' | 'gigs') => void;
  className?: string;
}

const categories = [
  { id: 'home' as const, label: 'Spotlight' },
  { id: 'music' as const, label: 'Music' },
  { id: 'guides' as const, label: 'Guides' },
  { id: 'industry' as const, label: 'Industry' },
  { id: 'gigs' as const, label: 'Gigs' }
];

export default function NewsNavigation({ activeCategory }: NewsNavigationProps) {
  return (
    <div>
      {categories.find(cat => cat.id === activeCategory)?.label}
    </div>
  );
}