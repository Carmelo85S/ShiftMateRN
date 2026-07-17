# ShiftMate 🕒

ShiftMate is a comprehensive workforce management platform designed to streamline staffing, shift scheduling, and financial budgeting for businesses. It bridges the gap between managers and workers through a real-time, cross-platform mobile experience.

## 📸 Screenshots

|              Dashboard               |                 Notifications                  |               Shifts Overview                |
| :----------------------------------: | :--------------------------------------------: | :------------------------------------------: | ------------------------------------------ |
| ![Home](ShiftMate/assets/screenshots/home.png) | ![Dashboard](assets/screenshots/dashboard.png) | ![History](ShiftMate/assets/screenshots/history.png) | ![Reports](ShiftMate/assets/screenshots/reports.png) |

## 🚀 Key Features

- **Multi-Role Architecture:** Dedicated interfaces for Managers (budgeting, planning) and Workers (shift management).
- **Real-Time Sync:** Instant updates on shift availability and notifications using Supabase Realtime.
- **Financial Control:** Real-time budget monitoring and reporting for department heads.
- **Secure Auth:** Role-Based Access Control (RBAC) ensuring data integrity and security.
- **Cross-Platform:** Built with Expo for seamless performance on iOS and Android.

## 🛠 Tech Stack

- **Frontend:** React Native (Expo), TypeScript
- **Backend & DB:** Supabase (PostgreSQL, Realtime, Auth)
- **Routing:** Expo Router
- **Styling:** React Native StyleSheet
- **Deployment:** EAS (Expo Application Services)

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo Go (for testing)

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/Carmelo85S/shiftmate.git](https://github.com/Carmelo85S/shiftmate.git)
   cd shiftmate
   npm install
   ```
1. Clone enviroment variables:
   Create a .env file in the root directory and add your Supabase credentials:

   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   ```bash
   npx expo start
   ```

## 🏗 Project Structure

/app # File-based routing (Expo Router)
/components # Reusable UI components (Shared, Worker, Manager)
/hooks # Custom logic and data fetching hooks
/constants # Theme and configuration
/lib # Supabase clients and utilities

## 📈 Roadmap

[x] Initial Architecture & Auth Flow
[x] Real-time Notification System
[ ] AI-Powered Shift Suggestions
[ ] Stripe Integration for Subscription Management
[ ] Advanced Reporting & Analytics Dashboard
