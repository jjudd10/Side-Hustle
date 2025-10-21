# Architectural Design Platform

A premium Next.js website for selling architectural floorplans and interior design packages. Built with a luxurious dark theme and classical design elements.

## Features

- **Home Page**: Scrollable sections showcasing different architectural styles
- **Style Pages**: Dedicated pages for Modern, Traditional, Luxury, and other design styles
- **Product Catalog**: Individual product pages with detailed descriptions and specifications
- **Luxurious Design**: Dark theme with gold accents and elegant typography
- **Responsive**: Fully responsive design for all devices
- **Next.js 14**: Built with App Router and TypeScript

## Architecture

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom luxury color palette
- **Typography**: Inter + Crimson Text fonts
- **TypeScript**: Full type safety throughout
- **Components**: Modular component architecture

## Color Palette

- Primary: Warm gold and bronze tones (#d4af37, #b87333, #cd7f32)
- Background: Deep dark gradients
- Text: White and gray variations
- Accents: Gold gradients and luxury shadows

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

## Design Philosophy

The platform embodies luxury and sophistication through:
- Dark, moody backgrounds with subtle gradients
- Gold accents and metallic elements
- Classical proportions and elegant typography
- Smooth animations and micro-interactions
- Premium feel with attention to detail

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
