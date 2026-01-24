# Architectural Design Platform


## Architecture

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom luxury color palette
- **Typography**: Inter + Crimson Text fonts
- **TypeScript**: Full type safety throughout
- **Components**: Modular component architecture

## Pages Structure

```
/ - Home page with style sections
/modern - Modern architectural designs
/traditional - Traditional/classical designs
/luxury - Luxury and high-end designs
/product/[id] - Individual product detail pages
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Deployment

This project is configured for deployment on Vercel with optimized Next.js settings.

## Components

- `Navigation`: Fixed navigation with mobile menu
- `HeroSection`: Animated hero with call-to-action
- `StyleSection`: Reusable sections for different design styles
- `ProductCard`: Product display cards with features
- Layout components with proper TypeScript types

## Future Enhancements

- Shopping cart functionality
- User authentication
- Payment integration
- Admin dashboard for content management
- Advanced filtering and search
- Customer testimonials and reviews

