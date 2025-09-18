# DreamWorks Lasso Design System

A comprehensive design system built on ShadCN UI, tailored for DreamWorks Animation's Lasso Digital Asset Management platform.

## Overview

This design system provides a unified set of components, patterns, and design tokens that combine the power of ShadCN UI with DreamWorks-specific branding and functionality. It serves as the foundation for building consistent, accessible, and scalable UX/UI across the Lasso platform.

## Architecture

### Core Technologies
- **ShadCN UI**: Component foundation with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **TypeScript**: Type-safe component development
- **Class Variance Authority (CVA)**: Component variant management
- **Lucide React**: Consistent iconography

### File Structure
```
src/
├── components/
│   └── ui/
│       ├── index.ts              # Component exports
│       ├── button.tsx            # ShadCN Button component
│       ├── card.tsx              # ShadCN Card component
│       ├── badge.tsx             # ShadCN Badge component
│       ├── asset-card.tsx        # Enhanced AssetCard component
│       ├── dashboard.tsx         # Enhanced Dashboard component
│       ├── *.stories.tsx         # Storybook stories
│       └── ...
├── lib/
│   └── utils.ts                  # Utility functions (cn, etc.)
└── index.css                     # Global styles and CSS variables
```

## Design Tokens

### Color System

The design system preserves your existing DreamWorks color palette while integrating ShadCN's semantic color system:

#### DreamWorks Colors (Legacy)
```css
/* Primary Blue Palette */
--color-primary-50: #eff6ff;   /* Very light blue */
--color-primary-500: #3b82f6;  /* Main brand blue */
--color-primary-600: #2563eb;  /* Interactive blue */
--color-primary-900: #1e3a8a;  /* Deep blue */

/* Secondary Gray Palette */
--color-secondary-50: #f8fafc;  /* Very light gray */
--color-secondary-500: #64748b; /* Mid gray */
--color-secondary-900: #0f172a; /* Very dark gray */

/* Accent */
--color-accent-500: #f59e0b;    /* Orange accent */
```

#### ShadCN Semantic Colors
```css
/* Semantic color system integrated with your palette */
--primary: 221.2 83.2% 53.3%;        /* Maps to your primary-600 */
--secondary: 210 40% 98%;             /* Light neutral */
--accent: 210 40% 98%;                /* Subtle accent */
--muted: 210 40% 98%;                 /* Muted backgrounds */
--border: 214.3 31.8% 91.4%;         /* Border colors */
--card: 0 0% 100%;                    /* Card backgrounds */
```

### Typography

- **Font Family**: Inter (system fallback: system-ui, sans-serif)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Scale**: Tailwind's default type scale with custom adjustments

### Spacing & Layout

- **Container**: Centered with max-width of 1400px
- **Border Radius**: Variable-based system (`--radius: 0.5rem`)
- **Shadows**: Tailwind's default shadow scale

## Components

### Core ShadCN Components

#### Button
```tsx
import { Button } from '@/components/ui';

<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
```

#### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

#### Badge
```tsx
import { Badge } from '@/components/ui';

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Error</Badge>
```

### Enhanced DreamWorks Components

#### AssetCard
Enhanced asset display component with ShadCN integration:

```tsx
import { AssetCard, AssetType } from '@/components/ui';

const asset = {
  id: '1',
  name: 'Dragon Character',
  type: AssetType.CHARACTER,
  fileSize: 15728640,
  dateModified: '2024-01-15',
  thumbnailUrl: 'https://example.com/image.jpg',
  tags: ['rigged', 'fantasy']
};

<AssetCard 
  asset={asset}
  selectable
  showActions
  variant="default"
/>
```

**Features:**
- Multiple display variants
- Selection state management
- Action button overlay
- Asset type badges
- Tag display
- Responsive design
- Accessibility support

#### Dashboard
Comprehensive dashboard component:

```tsx
import { Dashboard } from '@/components/ui';

<Dashboard 
  loading={false}
  recentAssets={assets}
  stats={{
    totalAssets: 1243,
    collections: 32,
    storageUsed: '42.3 GB',
    storageUsedPercentage: 67,
    activeUsers: 24
  }}
/>
```

**Features:**
- Statistics cards with icons
- Recent assets grid
- Activity feed
- Loading states
- Responsive layout

## Usage Guidelines

### Import Pattern
```tsx
// Preferred: Import from ui/index
import { Button, Card, AssetCard } from '@/components/ui';

// Alternative: Direct imports
import { Button } from '@/components/ui/button';
```

### Theming
The design system supports both light and dark themes:

```tsx
// Apply dark theme to any container
<div className="dark">
  <Dashboard />
</div>
```

### Customization
Components use the `cn()` utility for className merging:

```tsx
import { AssetCard, cn } from '@/components/ui';

<AssetCard 
  className={cn("custom-class", conditionalClass && "conditional")}
  asset={asset}
/>
```

### Responsive Design
All components are built mobile-first:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {assets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
</div>
```

## Development Workflow

### Adding New Components

1. **Create the component** in `src/components/ui/`
2. **Export it** from `src/components/ui/index.ts`
3. **Add TypeScript types** for props and variants
4. **Test accessibility** and responsive behavior
5. **Document usage examples**

### Using ShadCN CLI
Add new ShadCN components:

```bash
npx shadcn@latest add [component-name]
```

### Development
View and test components:

```bash
npm run dev
```

## Migration Guide

### From Legacy Components

**Old AssetCard:**
```tsx
import AssetCard from './AssetCard';
<AssetCard asset={asset} selectable selected />
```

**New AssetCard:**
```tsx
import { AssetCard } from '@/components/ui';
<AssetCard asset={asset} selectable selected showActions />
```

### Key Changes
- **Import paths**: Use `@/components/ui` barrel exports
- **Props**: Enhanced prop interfaces with better TypeScript support
- **Styling**: Consistent with ShadCN design system
- **Features**: Additional props like `showActions`, `variant`, etc.

## Best Practices

### Component Development
- Use TypeScript for all components
- Implement proper prop interfaces
- Support both controlled and uncontrolled patterns
- Include proper accessibility attributes
- Follow ShadCN naming conventions

### Styling
- Use Tailwind utility classes
- Leverage design tokens (CSS variables)
- Support dark mode
- Ensure responsive behavior
- Use the `cn()` utility for conditional classes

### Testing
- Write unit tests for all components
- Test different variants and states
- Verify accessibility compliance
- Test responsive behavior

## Resources

- [ShadCN UI Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

## Contributing

When contributing to the design system:

1. Follow existing patterns and conventions
2. Ensure backward compatibility when possible
3. Update documentation and examples
4. Test across different browsers and devices
5. Consider accessibility implications

This design system serves as the foundation for all future UI development in the Lasso platform, ensuring consistency, accessibility, and maintainability across the entire application.