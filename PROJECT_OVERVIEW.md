# Project Overview

This document provides a high-level overview of the project, its structure, and key components. It is intended to be a guide for developers to quickly understand the codebase and navigate it effectively.

## 1. Core Technologies

- **Framework**: [Next.js](https://nextjs.org/) (v15) - A React framework for building server-side rendered and static web applications.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - A statically typed superset of JavaScript.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
- **Database/Backend**: [Supabase](https://supabase.io/) - An open-source Firebase alternative for building backends.
- **Charting**: [Recharts](https://recharts.org/) - A composable charting library for React.
- **Icons**: [Lucide React](https://lucide.dev/) - A library of simply designed icons.
- **Date Manipulation**: [date-fns](https://date-fns.org/) - A modern JavaScript date utility library.

## 2. Project Structure

The project follows a standard Next.js App Router structure.

```
traker/
├── public/                  # Static assets
├── src/
│   ├── app/                 # Application routes
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # Authentication endpoints
│   │   │   ├── facebook/    # Facebook API integration
│   │   │   └── vendas/      # Sales data endpoints
│   │   ├── configuracoes/   # Configuration pages (currently empty)
│   │   ├── vendas/          # Sales-related pages
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main entry page (Dashboard)
│   ├── components/          # Reusable React components
│   ├── config/              # Project-wide configuration files
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Library code and utilities
├── next.config.ts           # Next.js configuration
├── package.json             # Project dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

### 2.1. `src/app`

This directory contains the core of the application, including all pages and API routes.

- **`page.tsx`**: The main page of the application, which renders the `Dashboard` component.
- **`layout.tsx`**: The root layout for the entire application.
- **`api/`**: Contains all the backend API routes, organized by functionality:
    - `auth/`: Handles user authentication, including Facebook login (`/api/auth/facebook`) and token verification (`/api/auth/verify`).
    - `facebook/`: Manages interactions with the Facebook Ads API, such as fetching campaigns (`/api/facebook/campaigns`), and modifying their state (e.g., pausing `/api/facebook/campaigns/pause` or changing budget `/api/facebook/campaigns/budget`).
    - `vendas/`: Provides endpoints for accessing sales data (`/api/vendas`).
- **`vendas/`**: The frontend for the sales page.
- **`configuracoes/`**: Intended for configuration pages, but its directory is currently empty.

### 2.2. `src/components`

This directory is crucial and contains all the reusable React components that make up the UI. Key components include:

- `Dashboard.tsx`: The main dashboard component that assembles various metrics and tables.
- `VendasPage.tsx`: The main component for the `/vendas` page.
- `CampaignsTable.tsx`: A table for displaying Facebook campaign data.
- `MetricsCard.tsx`: A card for displaying key performance indicators.
- `LoginForm.tsx`: A form for user login.
- `AuthGuard.tsx`: A component to protect routes that require authentication.

### 2.3. `src/lib`

This directory likely contains helper functions, utility classes, and the Supabase client initialization.

### 2.4. `src/hooks`

This directory is for custom React hooks, which encapsulate reusable logic.

## 3. Getting Started

1.  **Install dependencies**: `npm install`
2.  **Run the development server**: `npm run dev`
3.  **Open the application**: [http://localhost:3000](http://localhost:3000)

## 4. Key Files

- **`next.config.ts`**: Contains Next.js specific configurations, including performance optimizations.
- **`tailwind.config.js`**: Configuration file for Tailwind CSS.
- **`env.example`**: Example environment variables. Copy this to `.env.local` and fill in the required values (e.g., Supabase keys).

## 5. Navigation and Understanding Flow

1.  **Authentication**: The flow starts with the user logging in, likely through the `LoginForm` component. The `AuthGuard` component protects routes. Authentication logic is handled in `/api/auth`.
2.  **Dashboard**: After login, the user is presented with the `Dashboard` (`src/app/page.tsx` -> `src/components/Dashboard.tsx`).
3.  **Data Fetching**: The components in the dashboard and other pages fetch data from the API routes in `src/app/api`. For example, campaign data is fetched from `/api/facebook/campaigns`.
4.  **Facebook Integration**: The backend at `/api/facebook` communicates with the Facebook API to get and update campaign data.
5.  **Sales Data**: The `/vendas` page fetches data from `/api/vendas` to display sales information.

This overview should provide a solid starting point for understanding and navigating the project. 