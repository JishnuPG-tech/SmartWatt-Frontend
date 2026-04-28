<p align="center">
	<img src="https://img.shields.io/badge/Next.js-16-111111" alt="Next.js" />
	<img src="https://img.shields.io/badge/React-19-149ECA" alt="React" />
	<img src="https://img.shields.io/badge/TypeScript-5-3178C6" alt="TypeScript" />
	<img src="https://img.shields.io/badge/Tailwind-4-0EA5E9" alt="Tailwind" />
	<img src="https://img.shields.io/badge/Recharts-Visualization-1E88E5" alt="Recharts" />
	<img src="https://img.shields.io/badge/License-MIT-2E7D32" alt="License" />
</p>

# SmartWatt Frontend

SmartWatt Frontend is a Next.js application for household energy estimation workflows, including guided data input, appliance-level analytics, and historical dashboard views.

## Core Capabilities

- Multi-step assessment flow for household and appliance details.
- Quick and detailed analysis modes.
- Interactive charts for consumption distribution and trends.
- Assessment history with dashboard-level exploration.
- Authentication and persistence integration with Supabase.
- PDF report generation and what-if simulation display.

## Interface Preview

| Assessment Flow                                                                             | Dashboard                                                                                      |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| <img src="../docs/screenshots/smartwatt-workflow.png" alt="Assessment flow" width="100%" /> | <img src="../docs/screenshots/frontend-dashboard.png" alt="Frontend dashboard" width="100%" /> |

If images are not visible yet, add files in `docs/screenshots/` from the repository root.

## Technology Stack

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Recharts and Plotly
- Axios
- Supabase JavaScript client

## Project Layout

- `src/app/`: route-based pages including main flow, authentication, and dashboard.
- `src/components/`: reusable UI and feature components.
- `src/hooks/`: analysis and simulation orchestration hooks.
- `src/lib/`: API modules, transformations, utilities, and types.
- `src/config/`: appliance and usage form metadata.

## Local Setup

1. Move to the frontend directory.

```bash
cd Frontend
```

2. Install dependencies.

```bash
npm install
```

3. Configure environment variables.

```bash
copy .env.example .env.local
```

4. Start the development server.

```bash
npm run dev
```

5. Open http://localhost:3000.

## Build and Run

```bash
npm run build
npm run start
```

## UX Notes

- The interface supports quick and detailed assessment modes.
- Data-entry steps are designed for predictable user progression.
- Result visualizations are optimized for desktop and mobile layouts.

## Environment

At minimum, configure the backend API URL:

- `NEXT_PUBLIC_BACKEND_URL`

Additional Supabase variables can be configured based on deployment setup.

## License

Licensed under the MIT License. See `LICENSE`.
