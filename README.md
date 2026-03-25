# Stamp Calculator

A React + TypeScript stamp calculator that helps you determine the minimum additional stamps needed to meet a required postage amount.

The calculator supports:
- Entering available stamp denominations
- Tracking stamps you already picked
- Calculating the minimum number of extra stamps needed
- Showing total paid and overpay amount

## Tech Stack

- React 18
- TypeScript 5
- Vite 5
- GitHub Actions CI/CD
- Cloudflare Pages hosting

## Run Locally

### Prerequisites

- Node.js 20+ (recommended)
- npm 10+ (or the npm that ships with your Node version)

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Default local URL:

```text
http://localhost:5173
```

### Type Check

```bash
npm run check
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## CI/CD and Cloudflare Pages Deployment

This repo includes a GitHub Actions workflow at [.github/workflows/cloudflare-pages.yml](.github/workflows/cloudflare-pages.yml).

Workflow behavior:
- On pull requests to `main`: installs dependencies, runs type check, runs production build
- On pushes to `main`: runs CI checks and deploys the `dist` folder to Cloudflare Pages

### 1. Create a Cloudflare Pages Project

In Cloudflare Pages:
1. Create a new Pages project (if you do not already have one).
2. Note the project name exactly.

### 2. Create a Cloudflare API Token

Create a token with permissions required for Pages deployments.

### 3. Add GitHub Repository Secrets

In your GitHub repository settings, add these secrets:

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token for Pages deployment
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `CLOUDFLARE_PROJECT_NAME`: Your Cloudflare Pages project name

### 4. Push to Main

Push commits to `main` to trigger automatic deployment.

## Project Structure

- [stamp_calculator.tsx](stamp_calculator.tsx): Main calculator component (existing functionality preserved)
- [src/main.tsx](src/main.tsx): React entry point
- [src/styles.css](src/styles.css): Global styles
- [vite.config.ts](vite.config.ts): Vite config
- [tsconfig.json](tsconfig.json): TypeScript config
- [.github/workflows/cloudflare-pages.yml](.github/workflows/cloudflare-pages.yml): CI/CD pipeline

## Notes

- Monetary inputs are converted to cents internally to avoid floating-point math issues during calculations.
- The current logic and calculator behavior are preserved; project changes focus on making the frontend buildable and deployable.
