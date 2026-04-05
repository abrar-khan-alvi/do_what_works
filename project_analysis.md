# Project Analysis: Do What Works

A comprehensive "A to Z" breakdown of the project's architecture, design, and implementation.

## 🏗️ Architecture Overview

The project follows a modern **decoupled architecture**:
- **Frontend**: A high-performance SPA built with **React**, **TypeScript**, and **Vite**.
- **Backend**: A robust REST API powered by **Django** and **Django Rest Framework (DRF)**.
- **Database**: **SQLite** (development) with a well-defined schema for users, experiments, and chat sessions.
- **Communication**: JSON-based RESTful APIs with **JWT Authentication**.

---

## 🎨 Design & Aesthetics

The application boasts a **premium, dark-themed aesthetic** (as seen in `index.css` and component styles):
- **Visual Style**: Sleek "Glassmorphism" effect with transparent backgrounds and subtle borders.
- **Color Palette**: Sophisticated dark tones (`#0f1014`, `#1a1b1e`) complemented by vibrant accents and smooth gradients.
- **Interactivity**: 
  - Custom animations (`float`, `gradient-bg`) that make the UI feel alive.
  - Hover effects and micro-interactions for a tactile feel.
- **Typography**: Clean, modern sans-serif fonts (likely **Inter** or similar).
- **Responsiveness**: Precision-crafted layouts that adapt seamlessly from desktop to mobile.

---

## 💻 Frontend Implementation

### Core Technologies
- **React 18+**: For a component-based, reactive UI.
- **Tailwind CSS**: For utility-first styling and rapid design iteration.
- **Framer Motion**: (Implicitly suggested by the animation styles) for fluid transitions.
- **React Router**: For complex application state and navigation.

### State Management
- **Context API**: Extensive use of specialized contexts:
  - `AuthContext`: Manages user sessions and login state.
  - `ChatContext`: Handles real-time chat interactions.
  - `ExperimentContext`: Orchestrates experiment data across the app.
  - `AccessContext`: Likely manages feature gating and permissions.

### Key Pages
- **Interactive Workspace**: A sophisticated chat environment for interacting with "Daniel".
- **Tracking Dashboard**: Visual representation of active/queued experiments and daily logs.
- **Seamless Auth Flow**: A polished multi-step onboarding and authentication experience.

---

## ⚙️ Backend Implementation

### Django Apps
- **`accounts`**:
  - **Custom User Model**: Handles email-based auth and onboarding tracking.
  - **Deferred Bio-registration**: A secure pattern where accounts are only fully created after OTP verification.
  - **Onboarding Management**: Stores complex questionnaire data in `JSONField`.
- **`experiments`**:
  - **Chat System**: Manages conversation history with a flexible `JSONField` schema.
  - **Experiment Engine**: Tracks hypotheses, actions, and metrics.
  - **Daily Logging**: A relational system for tracking progress over time.

### Security & Reliability
- **JWT-based Auth**: Stateless and secure communication.
- **Data Integrity**: Foreign key relationships and unique constraints (e.g., one log per day per experiment).
- **DRF Serializers**: Clean data validation and transformation.

---

## 🚀 Key Features

1.  **AI Workspace ("Daniel")**: A chat-first interface where users can brainstorm and refine ideas.
2.  **Experiment Lifecycle**: Users can create, queue, and execute self-improvement experiments.
3.  **The Dig (Onboarding)**: A deep-dive questionnaire to personalize the user experience.
4.  **Daily Accountability**: Integrated logging to track experiment compliance and metric performance.
5.  **Subscription Tiering**: Ready-to-use infrastructure for paid access controls.

---

## 🔍 Potential Areas for Growth
- **Real-time Notifications**: To remind users to log their daily data.
- **Data Visualization**: Advanced charts to show experiment progress over weeks/months.
- **Social Integration**: Ability to share results or run group experiments.
- **Mobile App**: Wrapping the existing responsive web app into a PWAs or Capacitor container.
