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

# Using Figma Remote MCP
- IMPORTANT: Always use components from `/path_to_your_design_system` when possible
- Prioritize Figma fidelity to match designs exactly
- Avoid hardcoded values, use design tokens from Figma where available
- Follow WCAG requirements for accessibility
- Add component documentation
- Place UI components in `/path_to_your_design_system`; avoid inline styles unless truly necessary

## Figma MCP Integration Rules
These rules define how to translate Figma inputs into code for this project and must be followed for every Figma-driven change.

### Required flow (do not skip)
1. Run get_code first to fetch the structured representation for the exact node(s).
2. If the response is too large or truncated, run get_metadata to get the high‑level node map and then re‑fetch only the required node(s) with get_code.
3. Run get_screenshot for a visual reference of the node variant being implemented.
4. Only after you have both get_code and get_screenshot, download any assets needed and start implementation.
5. Translate the output (usually React + Tailwind) into this project's conventions, styles and framework.  Reuse the project's color tokens, components, and typography wherever possible.
6. Validate against Figma for 1:1 look and behavior before marking complete.

### Implementation rules
- Treat the Figma MCP output (React + Tailwind) as a representation of design and behavior, not as final code style.
- Replace Tailwind utility classes with the project's preferred utilities/design‑system tokens when applicable.
- Reuse existing components (e.g., buttons, inputs, typography, icon wrappers) instead of duplicating functionality.
- Use the project's color system, typography scale, and spacing tokens consistently.
- Respect existing routing, state management, and data‑fetch patterns already adopted in the repo.
- Strive for 1:1 visual parity with the Figma design. When conflicts arise, prefer design‑system tokens and adjust spacing or sizes minimally to match visuals.
- Validate the final UI against the Figma screenshot for both look and behavior.

# Baby Lasso Design System Integration Rules

## 1. Design System Structure

### 1.1 Token Definitions
- Design tokens are defined in `tailwind.config.js`
- Custom CSS variables are defined in `src/index.css`
- Department-specific color palettes are available in `tailwind.config.js`
- Typography scale is defined in `tailwind.config.js`

### 1.2 Component Library
- UI components are located in `src/components/ui/`
- Components use ShadCN patterns and are enhanced with custom styling
- Component variants are managed using Class Variance Authority (CVA)
- Component documentation can be found in the component files and `src/examples/`

### 1.3 Frameworks & Libraries
- React 18 with TypeScript
- Vite for building and development
- Tailwind CSS for styling
- ShadCN UI components
- Radix UI for primitives
- Lucide React for icons
- Vitest for testing

### 1.4 Asset Management
- No dedicated assets directory found
- Assets should be placed in the `public` directory
- Use relative paths to reference assets in components

### 1.5 Icon System
- Icon system is defined in `src/lib/icons.tsx`
- Uses Lucide React icons
- Custom department brand icons are available
- Icons can be imported from the `iconLibrary` object

### 1.6 Styling Approach
- Tailwind CSS for utility-first styling
- Custom CSS variables for theming
- Dark mode support using the `dark` class
- Department-specific theming available

### 1.7 Project Structure
- `src/components/ui/`: UI components
- `src/examples/`: Component showcases and documentation
- `src/lib/`: Utility functions and type definitions
- `src/index.css`: Global styles and CSS variables
- `tailwind.config.js`: Tailwind configuration and design tokens

## 2. Integration Rules

### 2.1 Using Design Tokens
- Always use design tokens from `tailwind.config.js` for colors, typography, and spacing
- Reference CSS variables for theming when appropriate
- Use the `iconLibrary` for consistent icon usage

### 2.2 Component Development
- Follow ShadCN component patterns
- Use TypeScript for type safety
- Implement variants using Class Variance Authority (CVA)
- Ensure proper ARIA attributes and keyboard navigation
- Include unit tests for component logic

### 2.3 Styling Guidelines
- Use Tailwind classes for styling
- Implement responsive designs using Tailwind's responsive utilities
- Support both light and dark themes
- Use department-specific color palettes when appropriate

### 2.4 Asset Usage
- Place assets in the `public` directory
- Reference assets using relative paths in components
- Optimize images and other assets before adding them to the project

### 2.5 Icon Implementation
- Use the `Icon` component from `src/lib/icons.tsx`
- Reference icons using their string keys from the `iconLibrary`
- Implement department-specific icons using the `DepartmentIcon` component

### 2.6 Accessibility
- Ensure proper color contrast ratios
- Implement keyboard navigation for interactive elements
- Use appropriate ARIA attributes
- Test components with screen readers

### 2.7 Performance Considerations
- Optimize component rendering using React best practices
- Minimize the use of heavy libraries or large assets
- Implement code splitting for larger components or pages

### 2.8 Documentation
- Include inline comments for complex logic
- Update component showcases in `src/examples/` when adding new components or variants
- Maintain a consistent documentation style across components

## 3. Figma Integration Process

1. Run `get_code` to fetch the structured representation of the Figma node(s)
2. If the response is too large, use `get_metadata` and re-fetch only required nodes
3. Run `get_screenshot` for a visual reference
4. Translate Figma output to the project's conventions and styles
5. Reuse existing components, color tokens, and typography wherever possible
6. Validate the implementation against the Figma screenshot for visual parity
7. Ensure the implementation follows the project's routing and state management patterns
8. Test the implementation for responsiveness and accessibility

## 4. Quality Assurance

- Run tests using `npm run test` or `npm run test:ui`
- Ensure all existing tests pass after making changes
- Add new tests for added functionality
- Validate visual consistency across different screen sizes
- Test in both light and dark modes
- Verify accessibility using automated tools and manual testing

By following these rules and guidelines, you'll ensure consistent integration of Figma designs into the Baby Lasso Design System, maintaining code quality, accessibility, and visual fidelity.