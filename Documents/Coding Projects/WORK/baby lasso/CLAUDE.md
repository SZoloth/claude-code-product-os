# CLAUDE.md

This file provides guidance to Claude Code when working with the Baby Lasso Design System project.

## Project Overview

**Baby Lasso Design System** is a comprehensive ShadCN-based component library built for DreamWorks Animation's Lasso Digital Asset Management platform. This project serves as the foundation for future UX/UI development with production-ready components, department-specific theming, and complete design tokens.

## Architecture & Technology Stack

### Core Technologies
- **Vite**: Fast build tool and development server
- **React 18**: UI framework with TypeScript
- **ShadCN UI**: Component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS with custom design tokens
- **Class Variance Authority (CVA)**: Component variant management
- **Lucide React**: Icon system
- **Vitest**: Testing framework

### Project Structure
```
src/
├── components/ui/           # ShadCN components with custom enhancements
├── examples/               # Design system showcase and documentation
├── lib/                   # Utilities, design tokens, and type definitions
├── main.tsx              # React application entry point
└── index.css             # Global styles and CSS variables
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with UI
npm run test:ui
```

## Design System Architecture

### Component Organization
- **Core ShadCN Components**: Button, Card, Badge - enhanced with custom styling
- **Department Components**: DepartmentButton, DepartmentBadge - department-specific theming
- **Enhanced Components**: AssetCard, Dashboard - complex DreamWorks-specific components  
- **Typography System**: Typography component with 15+ variants and convenience components
- **Icon System**: Comprehensive library with department branding icons

### Design Tokens
- **Department Colors**: 4 complete color palettes (Art, Modeling, LookDev, Groom)
- **Typography**: Open Sans font family with standardized scale
- **Spacing**: Tailwind default scale with container customization
- **Component Variants**: CVA-managed variants for consistent theming

## Key Files and Locations

### Component Files
- `src/components/ui/index.ts` - Main component export file
- `src/components/ui/asset-card.tsx` - Enhanced asset display component
- `src/components/ui/dashboard.tsx` - Dashboard component with stats
- `src/components/ui/department-*.tsx` - Department-themed components
- `src/components/ui/typography*.tsx` - Typography system components

### Design Token Files  
- `tailwind.config.js` - Custom design tokens and department colors
- `src/lib/department-themes.ts` - Department theming system
- `src/lib/typography.ts` - Typography variants and scale
- `src/lib/icons.tsx` - Icon library mapping

### Configuration Files
- `components.json` - ShadCN configuration
- `vite.config.ts` - Vite configuration with path aliases
- `tsconfig.json` - TypeScript configuration

## Development Guidelines

### Component Development
1. **Use ShadCN patterns**: Follow established ShadCN component patterns
2. **TypeScript first**: All components must have proper TypeScript interfaces
3. **CVA variants**: Use Class Variance Authority for component variants
4. **Accessibility**: Ensure proper ARIA attributes and keyboard navigation
5. **Testing**: Include unit tests for component logic

### Styling Conventions
1. **Tailwind utilities**: Use Tailwind classes for styling
2. **Design tokens**: Reference custom CSS variables and department colors
3. **Responsive design**: Mobile-first responsive patterns
4. **Dark mode**: Support both light and dark themes

### Import Patterns
```tsx
// Preferred: Import from barrel export
import { Button, AssetCard, Typography } from '@/components/ui';

// Alternative: Direct imports for specific components
import { Button } from '@/components/ui/button';
```

## Testing Strategy

### Unit Testing
- **Vitest**: Primary testing framework
- **@testing-library/react**: Component testing utilities
- **jsdom**: Browser environment simulation

### Test Locations
- Component tests: `src/components/ui/*.test.tsx`
- Utility tests: `src/lib/*.test.ts`

## Adding New Components

### ShadCN Components
```bash
# Add new ShadCN component
npx shadcn@latest add [component-name]

# Components are added to src/components/ui/
# Remember to export from src/components/ui/index.ts
```

### Custom Components
1. Create component file in `src/components/ui/`
2. Follow TypeScript and CVA patterns
3. Export from `src/components/ui/index.ts`
4. Add to design system showcase
5. Include tests and documentation

## Design References

The `design-reference-do-not-delete-folder/` contains additional design references:
- Artwork status systems
- Table component specifications  
- Breadcrumb patterns

These are preserved for future development and should not be deleted.

## Common Development Tasks

### Updating Department Colors
1. Modify `tailwind.config.js` color definitions
2. Update `src/lib/department-themes.ts` if needed
3. Test components in showcase

### Adding Typography Variants
1. Add variant to `src/lib/typography.ts`
2. Update component interfaces
3. Test in typography showcase

### Icon System Updates
1. Map new icons in `src/lib/icons.tsx`
2. Update icon showcase documentation
3. Ensure consistent sizing and theming

## Troubleshooting

### Common Issues
1. **Build failures**: Check TypeScript errors and import paths
2. **Styling issues**: Verify Tailwind classes and design token usage
3. **Component not found**: Ensure proper exports in index files

### Development Server
- **Port conflicts**: Default port is 5173, configure in vite.config.ts if needed
- **Path resolution**: Uses @ alias for src/ directory

## Integration Notes

This design system is ready for:
- Integration into larger Lasso applications
- Extension with additional components
- Department theme customization
- Accessibility auditing and improvements

The project follows modern React and TypeScript best practices, making it maintainable and extensible for future development needs.