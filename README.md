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

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Notes

- Monetary inputs are converted to cents internally to avoid floating-point math issues during calculations.
- The current logic and calculator behavior are preserved; project changes focus on making the frontend buildable and deployable.
