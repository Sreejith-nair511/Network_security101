# 🔐 Network Security 101 – Security Suite

## Overview
This project is a **Network Security Suite** built with **Next.js, TypeScript, and Tailwind CSS**.  
It demonstrates fundamental security concepts such as **user authentication, password security, and secure chat communication** in a modern web application.

## ✨ Features
- **User Authentication**
  - Secure login & signup pages
  - OAuth callback support
- **Password Security**
  - Password strength checker
  - Password leak detection using k-anonymity
- **Secure Chat System**
  - Real-time chat via WebSockets
  - User management (registration, login)
- **UI Components**
  - Custom reusable security-focused UI (alert dialogs, accordions, etc.)
- **Modern Frontend**
  - Built with Next.js App Router
  - Styled using TailwindCSS
  - TypeScript for safety

## 🛠️ Tech Stack
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend APIs:** Next.js API routes
- **Authentication:** Custom auth logic
- **Security Tools:** Password leak API, strength checker
- **Package Manager:** pnpm

## 📂 Project Structure

app/ # Next.js App Router pages & API routes
├── api/ # API endpoints (auth, chat, password checks)
├── auth/ # Login and Sign-up pages
├── globals.css # Global styles
└── page.tsx # Homepage
components/ # Reusable UI & security modules
├── security-suite.tsx
├── password-strength-checker.tsx
├── chat-interface.tsx
└── ...


## 🚀 Getting Started
1. Clone the repository:
   ```bash
   git clone https://github.com/Sreejith-nair511/Network_security101.git
   cd Network_security101

    Install dependencies:

pnpm install

Run the development server:

pnpm dev

Open in browser:

    http://localhost:3000

🔒 Security Concepts Demonstrated

    Strong authentication & session handling

    Password hashing and strength validation

    Leak detection using k-anonymity

    Secure WebSocket communication

    Principle of least privilege in component design

📜 License

This project is licensed under the MIT License.


---

# 📑 Network Security Project Report

## Title: **Implementation of a Security Suite Web Application for Network Security Fundamentals**

### 1. Introduction
The importance of **network security** lies in protecting systems, users, and communication against unauthorized access and data leaks. This project demonstrates key security concepts using a **modern web-based platform** built with Next.js and TypeScript.  

The main objective is to design a practical system that highlights **password security, authentication mechanisms, and secure communication** — the three pillars of online security.

---

### 2. Objectives
- To implement **secure user authentication**.
- To design a **password strength evaluation system**.
- To integrate **password leak detection** using publicly available breach data (via k-anonymity).
- To develop a **real-time secure chat interface** using WebSockets.
- To present a clean and modular frontend with reusable security-focused UI components.

---

### 3. System Design & Architecture
The system uses a **client-server model**:
- **Frontend (Client):** Next.js with TypeScript for rendering UI components, password strength checks, and secure login/signup forms.
- **Backend (Server):** Next.js API routes serving authentication, password leak detection, and chat WebSocket functionality.
- **Security Layers:** Password hashing, API-based leak detection, session validation.

**Architecture Flow:**
1. User interacts with **login/signup** pages.
2. Passwords are validated for **strength** and checked against known leaks.
3. If valid, users are authenticated and sessions are maintained securely.
4. Chat interface allows **real-time communication** via WebSocket API.
5. Alerts and dialogs provide feedback on security actions.

---

### 4. Implementation Details
- **Authentication:** Implemented using Next.js Auth routes with login, sign-up, and callback handlers.
- **Password Security:**
  - Strength checker ensures user selects robust credentials.
  - Password leak API checks against breached databases.
- **Secure Chat:** WebSocket-based communication ensures encrypted and real-time messaging.
- **UI & UX:** TailwindCSS + reusable components (dialogs, alerts, avatars) ensure a professional look with minimal attack surface.

---

### 5. Testing & Validation
- Password inputs tested with weak/strong cases.
- Leak detection tested using dummy breached hashes.
- Authentication tested with multiple users.
- Chat communication verified for real-time messaging.

---

### 6. Challenges
- Managing **WebSocket authentication** without leaks.
- Handling **password storage** with hashing.
- Ensuring **frontend security** (XSS/CSRF prevention).

---

### 7. Results & Observations
- The system successfully demonstrates **core security mechanisms**.
- Users are guided toward **strong password practices**.
- **Chat module** shows secure, real-time communication.
- Provides a foundation for scaling to enterprise-level security features.

---

### 8. Conclusion
This project provides a **practical implementation of network security concepts** within a modern web application. By combining authentication, password security, and secure communication, it illustrates how security principles are applied in real-world systems.  

**Future Enhancements:**
- Add **2FA (Two-Factor Authentication)**.
- Implement **end-to-end encryption (E2EE)** for chat.
- Integrate with **OAuth2/SSO providers**.
- Deploy on a secure cloud environment with HTTPS & monitoring.



<img width="1887" height="907" alt="image" src="https://github.com/user-attachments/assets/6b209d40-ef8b-47df-ba91-0c60ca5e9607" />

<img width="1887" height="907" alt="image" src="https://github.com/user-attachments/assets/23490592-fc80-496e-8ad0-0d918874ef06" />

<img width="1887" height="907" alt="image" src="https://github.com/user-attachments/assets/6381ed67-ac94-49e7-8939-4e84ef49bf31" />


