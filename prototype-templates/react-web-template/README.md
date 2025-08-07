# PROJECT_NAME_PLACEHOLDER

A modern web application built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling with custom design system
- **Radix UI** for accessible, unstyled UI components
- **React Query** for data fetching and caching
- **Zustand** for state management
- **React Hook Form** with Zod validation
- **Jest & React Testing Library** for unit testing
- **Playwright** for end-to-end testing
- **ESLint & Prettier** for code quality
- **GitHub Actions** for CI/CD
- **Vercel** deployment ready

## 📁 Project Structure

```
src/
├── app/                # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Homepage
│   └── providers.tsx   # React Query & Theme providers
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   ├── layout/        # Layout components
│   └── features/      # Feature-specific components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── store/             # Zustand stores
├── styles/            # Additional styles
├── types/             # TypeScript type definitions
└── utils/             # Helper functions
```

## 🛠️ Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## 🧪 Testing

### Unit Tests
```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui
```

## 🔧 Development

### Code Quality
```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check
npm run type-check
```

### Build & Deploy
```bash
# Build for production
npm run build

# Start production server
npm run start

# Analyze bundle size
npm run analyze
```

## 🚢 Deployment

### Vercel (Recommended)
This project is optimized for Vercel deployment:

1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically on every push to main

### Other Platforms
The app can also be deployed to:
- Netlify
- Railway
- AWS Amplify
- Google Cloud Platform

## 📚 Tech Stack Details

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless, accessible UI primitives

### State & Data
- **React Query**: Server state management
- **Zustand**: Client state management
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation

### Development
- **ESLint**: Code linting with Next.js config
- **Prettier**: Code formatting with Tailwind plugin
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities
- **Playwright**: End-to-end testing

### Deployment
- **Vercel**: Optimized for Next.js apps
- **GitHub Actions**: CI/CD pipeline
- **Environment Variables**: Secure configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

---

Built with ❤️ using the Rapid Prototype Template System