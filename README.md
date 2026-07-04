# Concepful

Concepful is a modern web application built with a robust monorepo architecture. The project uses Next.js 15 (App Router), React 19, and Tailwind CSS v4 on the frontend, powered by a strictly typed API client, Zod validations, and Drizzle ORM.

## Architecture

This repository is structured as a `pnpm` workspace, isolating the main application from its core reusable packages. 

```text
concepful/
├── apps/
│   └── concepful/                 # Main Next.js 15 Web Application
├── packages/
│   ├── api-client-react/          # Generated React Query hooks and custom fetch client
│   ├── api-spec/                  # API specifications and Orval configurations
│   ├── api-zod/                   # Shared Zod validation schemas
│   ├── db/                        # Drizzle ORM schema and database configuration
│   └── object-storage-web/        # Uppy configuration and object storage utilities
└── scripts/                       # Workspace utility scripts
```

## Prerequisites

- **Node.js**: v22+ recommended
- **Package Manager**: [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory and/or `apps/concepful/.env.local` to store your environment variables.

3. **Start the Development Server**
   To start the Next.js application with Turbopack:
   ```bash
   pnpm --filter "./apps/concepful" run dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

## Workspace Commands

Run these commands from the root of the repository:

- **Typecheck everything:**
  ```bash
  pnpm run typecheck
  ```
- **Build the application:**
  ```bash
  pnpm run build
  ```
- **List workspace packages:**
  ```bash
  pnpm -r list --depth=0
  ```

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query)
- **Database / ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Components**: [Radix UI](https://www.radix-ui.com/)
- **Package Manager**: [pnpm Workspaces](https://pnpm.io/workspaces)
