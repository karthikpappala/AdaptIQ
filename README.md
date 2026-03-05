# 🚀 AdaptIQ — Adaptive Learning & Career Intelligence Platform

AdaptIQ is an intelligent learning platform designed to provide **personalized learning paths, explanations, and career guidance** based on a user's knowledge level, behavior, and goals.

Unlike traditional chatbots, AdaptIQ maintains a **structured user model** that tracks learning progress and dynamically adapts content to improve understanding and skill development.

---

## 🧠 Project Overview

AdaptIQ is a **full-stack web application** that combines modern web technologies with large language models to create a **smart learning assistant**.

The platform focuses on:

* Personalized explanations
* Dynamic learning roadmaps
* Skill progression tracking
* Career intelligence suggestions

The system separates **long-term user modeling** from **recent interaction context**, allowing the platform to adapt explanations and recommendations over time.

---

## 🏗️ Architecture

The system is built using the following stack:

### Frontend

* React
* Vite
* Modern UI components
* Dynamic state management

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### AI / LLM Integration

* Groq API for fast LLM inference

---

## ⚙️ Key Features

### 📚 Adaptive Learning

* Adjusts explanation depth based on user understanding
* Supports beginner → advanced progression

### 🎯 Career Guidance

* Suggests potential career paths
* Recommends skills and technologies to learn

### 🧩 Personalized User Model

The system tracks:

* Learning history
* Concept mastery
* Interaction patterns

### ⚡ Fast AI Responses

Uses **Groq-powered LLM inference** for low-latency AI responses.

---

## 📂 Project Structure

AdaptIQ/

│

├── src/              # React frontend

├── server/           # Express backend

├── public/           # Static assets

│

├── package.json

├── vite.config.js

└── README.md

---

## 🚀 Installation & Setup

### 1. Clone the repository

git clone https://github.com/karthikpappala/AdaptIQ.git

cd AdaptIQ

### 2. Install dependencies

npm install

### 3. Setup environment variables

Create a `.env` file and add:

GROQ_API_KEY=your_api_key_here

MONGO_URI=your_mongodb_connection_string

### 4. Run the development server

npm run dev

Frontend will run on:

http://localhost:5173

---

## 🧪 Future Improvements

Planned improvements include:

* User authentication
* Learning analytics dashboard
* Skill graph visualization
* Multi-domain career intelligence
* Fine-tuned LLM integration

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

Developed by - **Karthik Pappala**
             - **Lokesh Babu**
             - **Amarnath Reddy**

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
