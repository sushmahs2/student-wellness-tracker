# 🌸 Saathi: Mental Wellness Tracker & Companion

An empathetic mental wellness platform and digital conversational companion designed for students preparing for high-stakes, competitive entrance exams like **JEE Main/Advanced** and **NEET**.

---

## ✨ Features & Architecture

This repository offers a **dual-framework experience** to support both online deployment and local Python testing:

1. **Live Preview (React + Express v4 + Gemini API)**:
   - A highly polished, responsive Single-Page React Web App styled with modern **Tailwind CSS**.
   - Features a custom lavender dark-pastel eye-soothing theme designed specifically for stressed students.
   - Built on top of a secure, production-ready server with **Express** and the `@google/genai` TypeScript SDK.
   - Includes real-time AI journal stress pattern decoding (Stress Triggers, Self-Doubt Models, Somatic Burnout warnings) and an interactive sidebar chat companion named **Saathi**.

2. **Local Python Applet (Streamlit + google-genai SDK)**:
   - Contains a standalone `app.py` script running a sleek Streamlit layout.
   - Seamlessly mirrors the React experience in a single-file Streamlit interface.

---

## 🚀 How to Run the App

### Option A: The Full-Stack React Web App (Live Preview)
In the development sandbox, the platform is already running this on port **3000** with Hot Module Replacement and production bundling setups.

To run it locally:
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your `.env` (API key needs to be configured as `GEMINI_API_KEY`):
   ```env
   GEMINI_API_KEY="your-gemini-key"
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:3000`.

---

### Option B: The Standalone Python Streamlit Applet
If you prefer running a pure Python app locally:

1. Install Python 3.10+ and the required packages:
   ```bash
   pip install -r requirements.txt
   ```
2. Configure your environment variable:
   ```bash
   export GEMINI_API_KEY="your-gemini-key"   # On Linux/macOS
   # OR
   set GEMINI_API_KEY="your-gemini-key"      # On Windows CMD
   ```
3. Start the Streamlit application:
   ```bash
   streamlit run app.py
   ```
4. A web browser tab will open automatically at `http://localhost:8501`.

---

## 🛠️ Tech Stack & Key Files
- `server.ts` - Production entry point (Express) supporting secure proxying for API keys.
- `src/App.tsx` - Complete frontend React architecture providing beautiful animations and clean visualizations.
- `app.py` - Complete Streamlit Python offline application.
- `requirements.txt` - Python project pip library declarations.
- `@google/genai` (Node) & `google-genai` (Python) - Utilizing Google's standard modern SDK and `gemini-3.5-flash` model structure for lightning-fast analysis and low-latency feedback.
