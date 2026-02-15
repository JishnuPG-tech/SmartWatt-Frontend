<div align="center">

# SmartWatt Frontend ⚡

### Modern UI for Kerala's First AI-Powered Energy Estimation System

[![Status](https://img.shields.io/badge/Status-Beta-blue)](https://github.com/JishnuPG-tech/SmartWatt-Frontend)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)](https://tailwindcss.com/)

**[Live Demo](#)** • **[Documentation](#-features)** • **[Architecture](ARCHITECTURE.md)** • **[Installation](#-installation)** • **[Contributing](CONTRIBUTING.md)** • **[License](#-license)**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#️-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Architecture](#-architecture)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

SmartWatt Frontend is a modern, responsive web application that provides an intuitive interface for Kerala households to estimate their electricity consumption and bills. Built with Next.js 16 and powered by our [Hybrid AI Backend](https://github.com/JishnuPG-tech/SmartWatt-Backend), it delivers real-time predictions with actionable energy-saving recommendations.

### Why SmartWatt?

Traditional electricity billing systems only show you the final bill amount without helping you understand **where** your energy goes or **how** to reduce costs. SmartWatt changes that by:

- 📊 Breaking down consumption by appliance
- 💡 Providing AI-powered savings recommendations
- 🎯 Running "What-If" scenarios for appliance upgrades
- 📱 Offering an intuitive, mobile-first experience

---

## ✨ Features

### Core Functionality

- ⚡ **Real-time Predictions**: Instant energy consumption estimates via Backend API integration
- 🏠 **Complete Household Analysis**: Add 22+ appliance types with custom parameters
- 📊 **Interactive Visualizations**: Beautiful charts with Recharts and Plotly.js
- 💰 **KSEB Tariff Calculator**: Accurate bill calculation with Kerala's slab-based pricing
- 💡 **Smart Recommendations**: AI-generated tips to reduce electricity bills
- 🎮 **What-If Simulator**: Compare scenarios (e.g., upgrading to 5-star appliances)
- 📄 **PDF Export**: Download detailed consumption reports with jsPDF
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🔐 **User Authentication**: Login/Register with Supabase integration
- 💾 **Save Configurations**: Store and load appliance setups
- 📈 **Usage Dashboard**: Visualize consumption history and trends
- 🔔 **Real-time Validation**: Client-side validation before API calls

### User Experience

- 🎨 **Modern UI**: Clean, intuitive interface with smooth animations
- 🌓 **Dark Mode Ready**: Built-in dark mode support (future enhancement)
- ♿ **Accessible**: WCAG 2.1 compliant with keyboard navigation
- ⚡ **Fast**: Optimized with Next.js 16 App Router and React Server Components
- 🔄 **Real-time Updates**: Instant feedback as you modify appliance parameters

---

## 📸 Screenshots

> **Note**: Add screenshots of your application here

<div align="center">

### Dashboard View
![Dashboard](docs/screenshots/dashboard.png)

### Appliance Input
![Appliance Input](docs/screenshots/appliance-input.png)

### Bill Breakdown
![Bill Breakdown](docs/screenshots/bill-breakdown.png)

### Recommendations
![Recommendations](docs/screenshots/recommendations.png)

</div>

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router with React 19) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict mode) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + PostCSS |
| **UI Components** | Custom components with shadcn/ui patterns |
| **Charts** | [Recharts](https://recharts.org/) 3.5.1, [Plotly.js](https://plotly.com/javascript/) 3.3.0 |
| **HTTP Client** | [Axios](https://axios-http.com/) 1.13.2 |
| **State Management** | React 19 Hooks (useState, useEffect, useContext) |
| **Forms** | Custom validation with Zod patterns |
| **PDF Generation** | [jsPDF](https://github.com/parallax/jsPDF) 3.0.4 + jsPDF-AutoTable 5.0.2 |
| **Icons** | [Lucide React](https://lucide.dev/) 0.554.0 |
| **Database** | [Supabase](https://supabase.com/) 2.84.0 (Optional) |
| **Deployment** | [Vercel](https://vercel.com/) (Optimized) |
| **Analytics** | Vercel Analytics 1.6.1 & Speed Insights 1.3.1 |

---

## 📦 Installation

### Prerequisites

- Node.js 18+ or later
- npm, yarn, or pnpm
- Git

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/JishnuPG-tech/SmartWatt-Frontend.git
   cd SmartWatt-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment file
   cp .env.example .env.local
   
   # Edit .env.local with your configuration
   # Required: NEXT_PUBLIC_BACKEND_URL
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open in browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - You should see the SmartWatt landing page

### Connecting to Backend

Make sure the Backend is running at the URL specified in `NEXT_PUBLIC_BACKEND_URL`:

```bash
# In your .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## 🚀 Usage

### Quick Start Guide

1. **Add Your First Appliance**
   - Click "Add Appliance" button
   - Select appliance type (e.g., "Ceiling Fan")
   - Enter power rating and daily usage hours
   - Specify quantity

2. **View Predictions**
   - Consumption is calculated instantly
   - See monthly kWh and cost estimates

3. **Explore Visualizations**
   - View pie charts for consumption breakdown
   - Analyze usage patterns with bar charts

4. **Get Recommendations**
   - AI suggests energy-saving tips
   - See potential savings from appliance upgrades

5. **Export Report**
   - Click "Download PDF Report"
   - Share or save for future reference

### Example Usage

```typescript
// Using the API client (internal)
import { predictAppliance } from '@/lib/api';

const result = await predictAppliance({
  name: "Air Conditioner",
  power: 1500,
  hoursPerDay: 6,
  starRating: 5,
  tonnage: 1.5
});

console.log(result);
// {
//   monthlyConsumption: 270.5,
//   method: "DEEP_LEARNING",
//   confidence: 94.2
// }
```

---

## 📁 Project Structure

```
SmartWatt-Frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx            # Home/Landing page
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── globals.css         # Global styles
│   │   ├── dashboard/          # Dashboard pages
│   │   │   └── page.tsx        # Main dashboard
│   │   ├── login/              # Login page
│   │   │   └── page.tsx
│   │   └── register/           # Registration page
│   │       └── page.tsx
│   │
│   ├── components/              # React components
│   │   ├── ApplianceSelection.tsx
│   │   ├── HouseholdInfo.tsx
│   │   ├── ResultsReport.tsx
│   │   ├── UsageDetails.tsx
│   │   ├── TariffVisualizer.tsx
│   │   ├── InteractiveLoader.tsx
│   │   ├── ui/                 # Reusable UI components
│   │   │   └── Skeleton.tsx
│   │   ├── dashboard/          # Dashboard-specific components
│   │   │   ├── BreakdownPieChart.tsx
│   │   │   ├── ApplianceBarChart.tsx
│   │   │   ├── UsageChart.tsx
│   │   │   ├── HistoryTable.tsx
│   │   │   └── DetailedBreakdownModal.tsx
│   │   └── usage/              # Usage tracking components
│   │       ├── ApplianceDetailCard.tsx
│   │       └── EventApplianceCard.tsx
│   │
│   ├── lib/                     # Utility functions
│   │   ├── api.ts             # API exports (barrel file)
│   │   ├── api/               # API client modules
│   │   │   ├── client.ts      # Axios instance
│   │   │   ├── health.ts      # Health check
│   │   │   ├── predictions.ts # Prediction endpoints
│   │   │   ├── billing.ts     # Bill calculation
│   │   │   ├── saveTraining.ts # Save training data
│   │   │   └── loadTraining.ts # Load training data
│   │   ├── types.ts           # TypeScript type definitions
│   │   ├── transformFields.ts # Data transformation utilities
│   │   └── diagnostics.tsx    # Diagnostic utilities
│   │
│   ├── hooks/                   # Custom React hooks
│   └── config/                  # Configuration files
│
├── public/                      # Static assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── Tests/                       # Test files
│   ├── unit/
│   └── integration/
│
├── Documents/                   # Documentation
│
├── next.config.ts              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
├── .env.example                # Environment variables template
└── README.md                   # This file
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```bash
# ============================
# Required Variables
# ============================

# Backend API URL (required)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# ============================
# Optional Variables
# ============================

# Supabase (for user authentication and data storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Feature Flags
NEXT_PUBLIC_ENABLE_DARK_MODE=false
NEXT_PUBLIC_ENABLE_PDF_EXPORT=true
NEXT_PUBLIC_ENABLE_SOCIAL_SHARE=true
```

> **Important**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

See [.env.example](.env.example) for a complete list with descriptions.

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JishnuPG-tech/SmartWatt-Frontend)

**Manual Deployment:**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - Add `NEXT_PUBLIC_BACKEND_URL` with your backend URL
   - Add other environment variables as needed

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app
   - Get a production URL (e.g., `smartwatt-frontend.vercel.app`)

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod
```

### Docker Deployment

```bash
# Build image
docker build -t smartwatt-frontend .

# Run container
docker run -p 3000:3000 smartwatt-frontend
```

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint -- --fix
```

---

## 🏛️ Architecture

For detailed system architecture and component interactions, see [ARCHITECTURE.md](ARCHITECTURE.md) (references Backend architecture).

**Frontend-Specific Topics:**
- Component hierarchy and organization
- API client structure
- State management patterns
- Data transformation layer
- Performance optimizations

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Quick Start

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for hosting and deployment platform
- **Tailwind CSS** for the utility-first CSS framework
- **Recharts** and **Plotly** for visualization libraries
- **Open Source Community** for inspiration and support

---

## 📞 Support

- **Documentation**: [Full Documentation](docs/)
- **Issues**: [GitHub Issues](https://github.com/JishnuPG-tech/SmartWatt-Frontend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/JishnuPG-tech/SmartWatt-Frontend/discussions)
- **Email**: [Support Email]

---

<div align="center">

**Made with ❤️ by the SmartWatt AI Team**

[Report Bug](https://github.com/JishnuPG-tech/SmartWatt-Frontend/issues) • [Request Feature](https://github.com/JishnuPG-tech/SmartWatt-Frontend/issues) • [View Demo](#)

**⭐ Star us on GitHub if you find this project helpful!**

</div>
