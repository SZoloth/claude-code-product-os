/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./index.html"
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // ShadCN color system integrated with department colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Department-specific color palettes from design reference
        art: {
          // Artwork Statuses
          'status-1': '#7A9FFF', // Blue
          'status-2': '#7ADFFF', // Light Blue  
          'status-3': '#B5CCFF', // Purple-Blue
          'status-4': '#FF759A', // Pink
          'status-5': '#FF8052', // Orange
          'status-6': '#FFD50D', // Yellow
          'status-7': '#A4C212', // Green-Yellow
          'status-8': '#C3F068', // Light Green
          // Legal Statuses
          'legal-1': '#F4CE2E', // Yellow
          'legal-2': '#FF759A', // Pink
          'legal-3': '#A2A882', // Sage
          'legal-4': '#531DAB', // Purple
          'legal-5': '#880742', // Dark Red
          // Picture Status
          'picture-1': '#F703F7', // Magenta
          'picture-2': '#880742', // Dark Red
          // Primary CTA
          'primary': '#FD02C2', // Bright Pink
          'primary-text': '#560094', // Dark Purple (70% opacity)
          // Common colors
          'text': {
            'white': '#FFFFFF',
            'light-gray': '#BBBBBB', 
            'gray': '#999999',
            'dark-gray': '#4D4D4D',
            'black': '#000000'
          },
          'stroke': {
            'light': '#999999',
            'medium': '#616161',
            'dark': '#333333'
          },
          'background': {
            'black': '#000000',
            'dark': '#111111'
          },
          'border': {
            'active': '#64C9FF',
            'selected': '#64C9FF'
          },
          'link': {
            'primary': '#59AFD9',
            'secondary': '#64C9FF'
          },
          'brand': '#FD02C2' // Same as primary for art
        },
        
        modeling: {
          'primary': '#7A9FFF', // Purple-Blue CTA
          'primary-text': '#560094', // Dark Purple (70% opacity)
          'text': {
            'white': '#FFFFFF',
            'light-gray': '#BBBBBB',
            'gray': '#999999', 
            'dark-gray': '#4D4D4D'
          },
          'table': {
            'dark': '#000000',
            'medium': '#BBBBBB',
            'light': '#999999',
            'lighter': '#4D4D4D'
          },
          'stroke': {
            'light': '#999999',
            'medium': '#616161', 
            'dark': '#333333'
          },
          'background': {
            'black': '#000000',
            'dark': '#111111'
          },
          'status': {
            'orange': '#12DE07',
            'red': '#F18302',
            'green': '#E00007'
          },
          'border': {
            'active': '#64C9FF'
          },
          'link': {
            'primary': '#55ABD9',
            'secondary': '#64C9FF'
          },
          'brand': '#7A9FFF' // Primary brand for modeling
        },
        
        lookdev: {
          'primary': '#A6FF7A', // Teal CTA  
          'primary-text': '#003E34', // Dark Teal (70% opacity)
          'text': {
            'white': '#FFFFFF',
            'light-gray': '#BBBBBB',
            'gray': '#999999',
            'dark-gray': '#4D4D4D'
          },
          'stroke': {
            'light': '#999999',
            'medium': '#616161',
            'dark': '#333333'
          },
          'background': {
            'black': '#000000',
            'dark': '#111111'
          },
          'variant': {
            'purple': '#500082',
            'blue': '#144097'
          },
          'border': {
            'active': '#64C9FF'
          },
          'link': {
            'primary': '#55ABD9', 
            'secondary': '#64C9FF'
          },
          'brand': '#A6FF7A' // Primary brand for lookdev
        },
        
        groom: {
          'primary': '#FF9B7A', // Orange-Salmon CTA
          'primary-text': '#942300', // Dark Orange (70% opacity)  
          'text': {
            'white': '#FFFFFF',
            'light-gray': '#BBBBBB',
            'gray': '#999999',
            'dark-gray': '#4D4D4D'
          },
          'stroke': {
            'light': '#999999',
            'medium': '#616161',
            'dark': '#333333'
          },
          'background': {
            'black': '#000000',
            'dark': '#111111'
          },
          'variant': {
            'teal': '#500082',
            'blue': '#144097'
          },
          'border': {
            'active': '#64C9FF'
          },
          'link': {
            'primary': '#55ABD9',
            'secondary': '#64C9FF'
          },
          'brand': '#FF9B7A' // Primary brand for groom
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Open Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Typography scale from design reference
        'xs': ['10px', { lineHeight: '12px' }],     // Small details, captions
        'sm': ['12px', { lineHeight: '16px' }],     // Labels, small text
        'base': ['14px', { lineHeight: '20px' }],   // Body text, default
        'md': ['16px', { lineHeight: '24px' }],     // Larger body text
        'lg': ['18px', { lineHeight: '28px' }],     // Subheadings
        'xl': ['20px', { lineHeight: '32px' }],     // Headings
        '2xl': ['24px', { lineHeight: '36px' }],    // Large headings
        '3xl': ['32px', { lineHeight: '40px' }],    // Page titles
        '4xl': ['36px', { lineHeight: '44px' }],    // Display headings
        '5xl': ['48px', { lineHeight: '56px' }],    // Hero text
      },
      fontWeight: {
        light: '300',     // Open Sans Light
        normal: '400',    // Open Sans Regular  
        medium: '500',    // Open Sans Medium
        semibold: '600',  // Open Sans Semi-Bold
        bold: '700',      // Open Sans Bold
        extrabold: '800', // Open Sans Extra Bold
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}