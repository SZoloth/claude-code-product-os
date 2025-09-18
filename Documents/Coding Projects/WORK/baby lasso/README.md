# Baby Lasso Design System

A comprehensive ShadCN-based design system built for DreamWorks Animation's Lasso Digital Asset Management platform. This design system provides production-ready components with department-specific theming, complete typography hierarchy, and a comprehensive icon library.

## 📋 Overview

This project started as a foundation using existing Storybook stories and evolved into a complete ShadCN UI-based design system. It serves as the component library and design foundation for future UX/UI development on the Lasso platform.

## 🎨 Design System Features

### Core Technologies
- **ShadCN UI**: Component foundation with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS with custom design tokens
- **TypeScript**: Type-safe component development
- **Class Variance Authority (CVA)**: Component variant management
- **Lucide React**: Consistent iconography
- **Open Sans**: Typography system

### Design Components

#### 🎨 Department Theming
Complete color system for 4 departments:
- **Art Department**: Pink/purple primary with status indicators
- **Modeling Department**: Blue/teal primary with workflow states
- **LookDev Department**: Orange/amber primary with render states
- **Groom Department**: Green/emerald primary with grooming stages

#### 🔤 Typography System
- **15+ variants**: From display headings to captions
- **Semantic HTML**: Automatic element selection
- **Open Sans font family**: Complete weight range (300-800)
- **Convenience components**: H1, H2, Text, Label, etc.

#### 🎭 Icon Library
- **50+ mapped icons**: Utility, branding, and department-specific
- **Categorized system**: Organized by function and use case
- **Department branding**: Custom Lasso department icons
- **Consistent sizing**: sm, md, lg, xl variants

#### 🧩 Enhanced Components
- **AssetCard**: Media display with selection and actions
- **Dashboard**: Statistics and recent assets overview
- **DepartmentButton**: Themed buttons for each department
- **DepartmentBadge**: Status indicators with department colors
- **ColorPalette**: Department color showcase

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Visit `http://localhost:5173` to see the design system showcase.

### Build
```bash
npm run build
```

### Testing
```bash
npm run test
npm run test:ui  # Visual test runner
```

### Deployment

#### Vercel Deployment
This project is configured for automatic deployment to Vercel:

1. **Connect to Vercel**: Link your GitHub repository to Vercel
2. **Automatic deployments**: Every push to `main` triggers a new deployment
3. **Preview deployments**: Pull requests get preview URLs for testing

**Manual deployment via Vercel CLI:**
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Environment Configuration:**
- Build command: `npm run build`
- Output directory: `dist`
- Node.js version: 18.x

## 📁 Project Structure

```
src/
├── components/
│   └── ui/                     # ShadCN components
│       ├── asset-card.tsx      # Enhanced asset display
│       ├── dashboard.tsx       # Dashboard component
│       ├── department-*.tsx    # Department-themed components
│       ├── typography*.tsx     # Typography system
│       ├── icon-showcase.tsx   # Icon documentation
│       └── index.ts           # Component exports
├── examples/
│   └── design-system-showcase.tsx  # Complete showcase
├── lib/
│   ├── department-themes.ts   # Department color system
│   ├── icons.tsx             # Icon library mapping
│   ├── typography.ts         # Typography variants
│   └── utils.ts              # Utilities (cn, etc.)
├── main.tsx                  # React entry point
└── index.css                 # Global styles
```

## 🎯 Usage Examples

### Basic Components
```tsx
import { Button, Card, Badge } from '@/components/ui';

<Button variant="default">Primary Action</Button>
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
<Badge variant="secondary">Status</Badge>
```

### Department Theming
```tsx
import { DepartmentButton, DepartmentBadge } from '@/components/ui';

<DepartmentButton department="art">Art Action</DepartmentButton>
<DepartmentBadge department="modeling" status="orange">
  In Progress
</DepartmentBadge>
```

### Typography System
```tsx
import { Typography, H1, H2, Text } from '@/components/ui';

<H1>Page Title</H1>
<H2>Section Heading</H2>
<Text>Body paragraph text</Text>
<Typography variant="caption" color="muted">
  Helper text
</Typography>
```

### Icons
```tsx
import { Icon } from '@/components/ui';

<Icon name="search" size="md" />
<Icon name="lasso-art" size="lg" />
<Icon name="filter" className="text-primary" />
```

### Enhanced Components
```tsx
import { AssetCard, Dashboard } from '@/components/ui';

<AssetCard 
  asset={asset}
  selectable
  showActions
  onSelect={handleSelect}
/>

<Dashboard 
  recentAssets={assets}
  stats={dashboardStats}
/>
```

## 🎨 Design Tokens

### Colors
Department-specific color palettes are defined in `tailwind.config.js`:
- Primary colors for branding
- Status colors for workflow states
- Semantic colors for UI states

### Typography Scale
Open Sans font family with standardized sizes:
- Display: 48px, 36px (Bold)
- Headings: 32px, 24px, 20px, 18px, 16px, 14px
- Body: 16px, 14px, 12px (Regular)
- UI: Labels, buttons, captions (Medium/Semi-Bold)

### Spacing & Layout
Following Tailwind's default spacing scale with custom container sizing.

## 🔧 Development

### Adding New Components
1. Create component in `src/components/ui/`
2. Export from `src/components/ui/index.ts`
3. Add TypeScript types
4. Include in showcase for documentation

### Using ShadCN CLI
Add new ShadCN components:
```bash
npx shadcn@latest add [component-name]
```

### Customization
Components use the `cn()` utility for className merging:
```tsx
<AssetCard 
  className={cn("custom-class", conditionalClass && "conditional")}
  asset={asset}
/>
```

## 📚 Documentation

The complete design system can be viewed by running the development server. The showcase includes:
- All component variants and states
- Typography hierarchy examples
- Color palette demonstrations
- Icon library overview
- Usage code examples

## 🤝 Contributing

When contributing:
1. Follow existing patterns and conventions
2. Ensure TypeScript compliance
3. Test components in different states
4. Update documentation and examples
5. Maintain accessibility standards

## 📦 Dependencies

### Core Dependencies
- `react` & `react-dom`: React framework
- `@radix-ui/react-slot`: Radix UI primitives
- `class-variance-authority`: Component variants
- `clsx` & `tailwind-merge`: Utility functions
- `lucide-react`: Icon library
- `tailwindcss-animate`: Animation utilities

### Development Dependencies
- `vite`: Build tool and dev server
- `typescript`: Type checking
- `tailwindcss`: CSS framework
- `vitest`: Testing framework
- `@testing-library/react`: React testing utilities

## 🎯 Future Development

This design system is ready for:
- Integration into larger Lasso applications
- Extension with additional department themes
- Integration with Figma design tokens
- Storybook documentation (if needed)
- Component testing and accessibility audits

Built with ❤️ for DreamWorks Animation's Lasso platform.