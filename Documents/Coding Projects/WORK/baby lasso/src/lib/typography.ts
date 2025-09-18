import { type VariantProps, cva } from "class-variance-authority";

// Typography scale based on design reference
export const typographyVariants = cva("", {
  variants: {
    variant: {
      // Display headings
      'display-1': 'text-5xl font-bold tracking-tight',       // 48px, Bold
      'display-2': 'text-4xl font-bold tracking-tight',       // 36px, Bold
      
      // Page and section headings
      'heading-1': 'text-3xl font-semibold tracking-tight',   // 32px, Semi-Bold
      'heading-2': 'text-2xl font-semibold tracking-tight',   // 24px, Semi-Bold
      'heading-3': 'text-xl font-semibold',                   // 20px, Semi-Bold
      'heading-4': 'text-lg font-medium',                     // 18px, Medium
      'heading-5': 'text-md font-medium',                     // 16px, Medium
      'heading-6': 'text-base font-medium',                   // 14px, Medium
      
      // Body text
      'body-large': 'text-md font-normal',                    // 16px, Regular
      'body': 'text-base font-normal',                        // 14px, Regular
      'body-small': 'text-sm font-normal',                    // 12px, Regular
      
      // UI text
      'label': 'text-sm font-medium',                         // 12px, Medium
      'label-small': 'text-xs font-medium',                   // 10px, Medium
      'button': 'text-sm font-semibold',                      // 12px, Semi-Bold
      'button-large': 'text-base font-semibold',              // 14px, Semi-Bold
      
      // Captions and details
      'caption': 'text-xs font-normal',                       // 10px, Regular
      'caption-bold': 'text-xs font-semibold',                // 10px, Semi-Bold
      'overline': 'text-xs font-semibold uppercase tracking-wider', // 10px, Semi-Bold, Uppercase
      
      // Code and monospace
      'code': 'text-sm font-mono',                            // 12px, Monospace
      'code-small': 'text-xs font-mono',                      // 10px, Monospace
    },
    color: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      secondary: 'text-secondary-foreground',
      accent: 'text-accent-foreground',
      destructive: 'text-destructive',
      white: 'text-white',
      black: 'text-black',
      // Department colors
      'art-primary': 'text-art-primary',
      'modeling-primary': 'text-modeling-primary',
      'lookdev-primary': 'text-lookdev-primary',
      'groom-primary': 'text-groom-primary',
    }
  },
  defaultVariants: {
    variant: "body",
    color: "default",
  },
});

export type TypographyVariant = VariantProps<typeof typographyVariants>['variant'];
export type TypographyColor = VariantProps<typeof typographyVariants>['color'];

// Typography scale information for documentation
export const typographyScale = {
  'display-1': { size: '48px', weight: 'Bold (700)', lineHeight: '56px', usage: 'Hero text, main page titles' },
  'display-2': { size: '36px', weight: 'Bold (700)', lineHeight: '44px', usage: 'Large display headings' },
  'heading-1': { size: '32px', weight: 'Semi-Bold (600)', lineHeight: '40px', usage: 'Page titles, main sections' },
  'heading-2': { size: '24px', weight: 'Semi-Bold (600)', lineHeight: '36px', usage: 'Section headings' },
  'heading-3': { size: '20px', weight: 'Semi-Bold (600)', lineHeight: '32px', usage: 'Subsection headings' },
  'heading-4': { size: '18px', weight: 'Medium (500)', lineHeight: '28px', usage: 'Component titles' },
  'heading-5': { size: '16px', weight: 'Medium (500)', lineHeight: '24px', usage: 'Card titles, small headings' },
  'heading-6': { size: '14px', weight: 'Medium (500)', lineHeight: '20px', usage: 'List headings, labels' },
  'body-large': { size: '16px', weight: 'Regular (400)', lineHeight: '24px', usage: 'Large body text, introductions' },
  'body': { size: '14px', weight: 'Regular (400)', lineHeight: '20px', usage: 'Default body text, descriptions' },
  'body-small': { size: '12px', weight: 'Regular (400)', lineHeight: '16px', usage: 'Small body text, details' },
  'label': { size: '12px', weight: 'Medium (500)', lineHeight: '16px', usage: 'Form labels, UI labels' },
  'label-small': { size: '10px', weight: 'Medium (500)', lineHeight: '12px', usage: 'Small labels, tags' },
  'button': { size: '12px', weight: 'Semi-Bold (600)', lineHeight: '16px', usage: 'Button text, CTAs' },
  'button-large': { size: '14px', weight: 'Semi-Bold (600)', lineHeight: '20px', usage: 'Large button text' },
  'caption': { size: '10px', weight: 'Regular (400)', lineHeight: '12px', usage: 'Captions, footnotes' },
  'caption-bold': { size: '10px', weight: 'Semi-Bold (600)', lineHeight: '12px', usage: 'Important captions' },
  'overline': { size: '10px', weight: 'Semi-Bold (600)', lineHeight: '12px', usage: 'Overlines, categories' },
  'code': { size: '12px', weight: 'Mono', lineHeight: '16px', usage: 'Code snippets, technical text' },
  'code-small': { size: '10px', weight: 'Mono', lineHeight: '12px', usage: 'Small code, file names' },
};

// Predefined typography combinations for common use cases
export const typographyPresets = {
  // Card components  
  cardTitle: { variant: 'heading-5' as TypographyVariant, color: 'default' as TypographyColor },
  cardDescription: { variant: 'body-small' as TypographyVariant, color: 'muted' as TypographyColor },
  cardCaption: { variant: 'caption' as TypographyVariant, color: 'muted' as TypographyColor },
  
  // Dashboard elements
  dashboardTitle: { variant: 'heading-1' as TypographyVariant, color: 'default' as TypographyColor },
  dashboardSubtitle: { variant: 'body-large' as TypographyVariant, color: 'muted' as TypographyColor },
  statValue: { variant: 'heading-2' as TypographyVariant, color: 'default' as TypographyColor },
  statLabel: { variant: 'label' as TypographyVariant, color: 'muted' as TypographyColor },
  
  // Forms
  fieldLabel: { variant: 'label' as TypographyVariant, color: 'default' as TypographyColor },
  fieldHelp: { variant: 'caption' as TypographyVariant, color: 'muted' as TypographyColor },
  fieldError: { variant: 'caption' as TypographyVariant, color: 'destructive' as TypographyColor },
  
  // Navigation
  navLink: { variant: 'body' as TypographyVariant, color: 'default' as TypographyColor },
  navLinkActive: { variant: 'body' as TypographyVariant, color: 'primary' as TypographyColor },
  breadcrumb: { variant: 'body-small' as TypographyVariant, color: 'muted' as TypographyColor },
  
  // Tables
  tableHeader: { variant: 'label' as TypographyVariant, color: 'muted' as TypographyColor },
  tableCell: { variant: 'body' as TypographyVariant, color: 'default' as TypographyColor },
  tableCellSmall: { variant: 'body-small' as TypographyVariant, color: 'default' as TypographyColor },
};