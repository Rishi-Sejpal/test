# CyberCISO Frontend

Next.js + Tailwind CSS frontend for the CyberCISO virtual CISO application.

## Setup

```bash
npm install
cp ../.env.example .env.local
# Edit .env.local with NEXT_PUBLIC_API_URL
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

## Deployment

Deploy to Vercel:

```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.