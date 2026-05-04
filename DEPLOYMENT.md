# 🚀 Deployment Guide: Mind Mirror+

This guide covers how to deploy the **Mind Mirror+** full-stack application to production environments.

---

## 🏗️ Architecture Overview
- **Backend**: Django REST Framework (Python)
- **Frontend**: React (Vite + TypeScript)
- **Database**: PostgreSQL (Recommended for production)
- **AI Models**: Local `.h5` files (mini-XCEPTION)

---

## 🛠️ Option 1: Docker (Recommended)
Docker is the most reliable way to deploy as it bundles the environment, dependencies, and AI models together.

### 1. Build and Run
```bash
# In the root directory (dinu_project)
docker-compose up --build
```

### 2. Configure Environment
Create a `.env` file in the root:
```env
DEBUG=False
SECRET_KEY=your-secure-secret-key
DATABASE_URL=postgres://user:password@db:5432/mindmirror
ALLOWED_HOSTS=yourdomain.com,localhost
```

---

## ☁️ Option 2: PaaS (Heroku / Render / Railway)

### Backend (Django)
1. **Gunicorn**: Use `gunicorn` as the web server (included in `requirements.txt`).
2. **Static Files**: Use `WhiteNoise` (configured in `settings.py`) to serve static files.
3. **Database**: Attach a PostgreSQL add-on.
4. **Environment Variables**: Set `DJANGO_SETTINGS_MODULE`, `SECRET_KEY`, and `DATABASE_URL` in the platform's dashboard.

### Frontend (React)
1. **Build**: Run `npm run build` locally or in CI.
2. **Host**: Upload the `dist/` folder to **Vercel**, **Netlify**, or **GitHub Pages**.
3. **API URL**: Ensure `API_URL` in `src/context/AuthContext.tsx` points to your deployed backend URL.

---

## 🔒 Security Checklist
- [ ] Set `DEBUG=False`.
- [ ] Use a strong `SECRET_KEY` stored in environment variables.
- [ ] Enable `SECURE_SSL_REDIRECT` in `settings.py`.
- [ ] Configure `CORS_ALLOWED_ORIGINS` to only allow your frontend domain.

---

## 📦 Production Settings Update
The project has been updated with:
- **WhiteNoise**: For efficient static file serving.
- **Environment Variables**: Support for `SECRET_KEY` and `DEBUG` via `.env`.
- **Gunicorn**: Ready for high-concurrency production traffic.

---

*For detailed platform-specific steps, refer to the official documentation of [Heroku](https://devcenter.heroku.com/articles/deploying-python) or [Vercel](https://vercel.com/docs/frameworks/vite).*
