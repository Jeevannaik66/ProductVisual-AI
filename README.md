# ProductVisual-AI

Marketing agency tool to generate AI-powered product ad images for beauty and cosmetic products.

---

## 🌐 Live Demo

[Frontend Live Demo](https://product-visual-ai.vercel.app)  
[Backend API (Render / Vercel)](https://product-ad-backend-latest.onrender.com)

---

## 🖼 Screenshots / Demo

**Signup Page**  
<img width="1910" height="1002" alt="Signup Page" src="https://github.com/user-attachments/assets/bcca034a-86d9-40c3-9994-ec820144cf51" />

**Signin Page**  
<img width="1910" height="982" alt="Signin Page" src="https://github.com/user-attachments/assets/9fa6d908-6e36-4d15-9694-41b09550ce43" />

**Dashboard**  
<img width="1910" height="982" alt="Dashboard" src="https://github.com/user-attachments/assets/63e25f8a-6d76-4d7a-83d1-22e0125af3e7" />

**Image Generation Page**  
<img width="1910" height="2004" alt="Image Generation" src="https://github.com/user-attachments/assets/d7d68374-9241-4e35-855d-9438bb6f47aa" />

**Gallery Page**  
<img width="1910" height="982" alt="Gallery Page" src="https://github.com/user-attachments/assets/8122fe83-8dd0-4864-88b3-9511d9367508" />


---

## ✨ Features

- User authentication (Signup/Login) via Supabase Auth
- AI-powered prompt enhancement
- Image generation using Gemini / DALL·E
- Save and manage generated images in Supabase Storage
- View, download, and delete generated product ads
- Responsive frontend built with Vite + React
- Error handling and retry mechanisms for API calls

---

## 🛠 Tech Stack

- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Node.js, Express
- **Database & Storage:** Supabase
- **AI Service:** Gemini
- **Deployment:** Vercel (Frontend), Render / Vercel Docker (Backend)

---

## 🚀 Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/ProductVisual-AI.git
cd ProductVisual-AI
````

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_or_service_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

Run backend:

```bash
npm run start
# OR using Docker
docker build -t productvisual-backend .
docker run -p 5000:5000 --env-file .env productvisual-backend
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` in the frontend:

```env
VITE_API_BASE_URL=https://product-ad-backend-latest.onrender.com
```

Run frontend locally:

```bash
npm run dev
```

---

## 🔑 API Keys Setup

1. **Supabase:**

   * Go to [Supabase](https://supabase.com) → create a project
   * Get your `SUPABASE_URL` and `SUPABASE_KEY` from Settings → API

2. **Gemini / DALL·E:**

   * Register on [Gemini](https://developers.google.com/ai) / OpenAI
   * Get your API key and add to `.env` as `GEMINI_API_KEY`

---

## 🧩 Challenges & Solutions

* **Problem:** CORS errors when frontend tried to call backend on Render
  **Solution:** Added `cors()` middleware in Express and updated frontend API URLs to deployed backend.

* **Problem:** Large base64 images caused payload issues
  **Solution:** Increased JSON payload limit in Express: `express.json({ limit: "10mb" })`.

---

## 🔮 Future Improvements

* Add **batch image generation** for multiple product prompts
* Implement **customizable ad templates and styles**
* Add **user profile and history analytics**
* Add **real-time image generation progress feedback**

