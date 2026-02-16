# SmartWatt AI - Frontend ⚡

 Physics-Informed Integrated Hybrid AI Architecture for Energy Estimation. 

![SmartWatt Status](https://img.shields.io/badge/Status-Beta-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)

SmartWatt is a next-generation residential energy estimation tool designed for Kerala households. It solves the "Linear Load Paradox" by combining Deep Learning (for complex loads like ACs and Fridges) with Physics-based constraints (for linear loads like Fans and Lights).

This repository contains the  Frontend  built with [Next.js](https://nextjs.org/), offering a responsive, modern interface for users to input their appliance details and receive highly accurate bill predictions.

---

## 🚀 Features

-    Hybrid AI Interface : Seamlessly gathers user inputs that feed into our Dual-Inference Engine.
-    Dynamic Dashboard : Visualizes energy consumption with interactive charts (Recharts/Plotly).
-    Smart Recommendations : Provides AI-generated insights to reduce electricity bills (e.g., "Switching to a 5-star AC saves ₹400/month").
-    User Intent Override : Respects manual usage inputs while intelligently adjusting efficiency factors in the background.
-    Responsive Design : Optimized for both Desktop and Mobile devices.

## 🛠️ Tech Stack

-    Framework : [Next.js](https://nextjs.org/) (React)
-    Styling : [Tailwind CSS](https://tailwindcss.com/)
-    Visualization : [Recharts](https://recharts.org/), Plotly.js
-    State Management : React Hooks
-    Language : TypeScript

## 📦 Getting Started

1.   Clone the repository: 
    ```bash
    git clone https://github.com/JishnuPG-tech/SmartWatt-Frontend.git
    cd SmartWatt-Frontend
    ```

2.   Install dependencies: 
    ```bash
    npm install
    # or
    yarn install
    ```

3.   Run the development server: 
    ```bash
    npm run dev
    ```

4.   Open in Browser: 
    Navigate to [http://localhost:3000](http://localhost:3000).

## 🚀 Deployment

This project is optimized for deployment on  Vercel .

1.  Push your code to GitHub.
2.  Import the repository into Vercel.
3.  Set the `NEXT_PUBLIC_BACKEND_URL` environment variable to your backend URL (e.g., your Render hosted API).
4.  Click  Deploy .

## 📄 License 

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Developed by the SmartWatt AI Team.*
