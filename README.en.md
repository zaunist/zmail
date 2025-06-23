# <div align="center">🚀 ZMAIL - 24-hour Temporary Email Service</div>

<div align="center">
  <p>
    <strong>English</strong> | <a href="./README.md">中文</a>
  </p>

  <p>If you find this project helpful, please consider giving it a ⭐️ Star ⭐️. Your support is greatly appreciated!</p>
  
  <img src="frontend/public/favicon.svg" alt="ZMAIL Logo" width="120" height="120" style="background-color: #4f46e5; padding: 20px; border-radius: 12px; margin: 20px 0;">
  
  <h3>💌 Secure, Simple, Disposable Email Service</h3>

  <p>
    <a href="https://mail.mdzz.uk" target="_blank"><strong>🌐 Live Demo</strong></a> •
    <a href="#features"><strong>✨ Features</strong></a> •
    <a href="#quick-deployment"><strong>🚀 Deployment</strong></a> •
    <a href="#local-development"><strong>💻 Development</strong></a> •
    <a href="#tech-stack"><strong>🔧 Tech Stack</strong></a>
  </p>
  
  <div style="display: flex; gap: 10px; justify-content: center; margin: 25px 0;">
    <a href="https://dash.cloudflare.com/" target="_blank">
      <img src="https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare" />
    </a>
  </div>
</div>

---

## 📹 Video Tutorial

<div align="center">
  <a href="https://youtu.be/domoWldyXrc?si=9l3JN5AbtiaTS3_L" target="_blank">
    <img src="https://img.shields.io/badge/Watch_YouTube_Tutorial-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube Tutorial" width="250" />
  </a>
</div>

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <p>📺 The complete video tutorial covers:</p>
  <ol>
    <li>Project introduction and feature demonstration</li>
    <li>Detailed steps for frontend deployment to Cloudflare Pages</li>
    <li>Detailed steps for backend deployment to Cloudflare Workers</li>
    <li>Configuring Cloudflare Email routing</li>
    <li>Setting up environment variables and database</li>
  </ol>
  <p>👉 <a href="https://youtu.be/domoWldyXrc?si=9l3JN5AbtiaTS3_L" target="_blank" style="color: #4f46e5;">Click here to watch the full tutorial</a></p>
</div>

---

## ✨ Features

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0;">
  <div>
    <h4>✨ Instant Creation</h4>
    <p>Get a temporary email address instantly, no registration required</p>
  </div>
  <div>
    <h4>🔒 Privacy Protection</h4>
    <p>Protect your real email from spam and data leaks</p>
  </div>
  <div>
    <h4>⚡ Real-time Reception</h4>
    <p>Receive emails in real-time without refreshing the page</p>
  </div>
  <div>
    <h4>🌐 Global Availability</h4>
    <p>Built on Cloudflare's global edge network for fast access worldwide</p>
  </div>
  <div>
    <h4>🔄 Auto-refresh</h4>
    <p>Automatically check for new emails, never miss important messages</p>
  </div>
  <div>
    <h4>📱 Responsive Design</h4>
    <p>Perfect fit for all devices, from mobile to desktop</p>
  </div>
</div>

---

## 🚀 Quick Deployment

ZMAIL consists of two parts that need to be deployed separately, deploy the backend first, then the frontend:

### ⚙️ Backend Deployment

<div align="center">
  <h3>2️⃣ Deploy Backend to Cloudflare Workers</h3>
  <a href="https://dash.cloudflare.com/?to=/:account/workers/new" target="_blank">
    <img src="https://img.shields.io/badge/Deploy_to_Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Deploy Backend to Cloudflare Workers" width="300" />
  </a>
</div>

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <ol>
    <li>Click the "Deploy to Cloudflare Workers" button</li>
    <li>Connect your GitHub account and select this repository</li>
    <li>Configure build settings:
      <ul>
        <li>Deploy command: <code>yarn deploy</code></li>
        <li>Advanced settings -> Root directory: <code>/worker</code></li>
      </ul>
    </li>
    <li>Configure D1 database:
      <ul>
        <li>Create a D1 database (e.g., <code>mail_db</code>)</li>
        <li>Bind it to your Worker (binding name: <code>DB</code>)</li>
      </ul>
    </li>
    <li>Configure Email routing:
      <ul>
        <li>Set up Email routing in the Cloudflare dashboard to forward emails to your Worker</li>
        <li>If you want to configure multiple domain emails, set up email forwarding for each domain to the worker in the CloudFlare dashboard</li>
      </ul>
    </li>
    <li>Click "Deploy"</li>
  </ol>
</div>

---

### 🖥️ Frontend Deployment

<div align="center">
  <h3>1️⃣ Deploy Frontend to Cloudflare Pages</h3>
  <a href="https://dash.cloudflare.com/?to=/:account/pages/new/import-git" target="_blank">
    <img src="https://img.shields.io/badge/Deploy_to_Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Deploy Frontend to Cloudflare Pages" width="300" />
  </a>
</div>

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <ol>
    <li>Click the "Deploy to Cloudflare Pages" button</li>
    <li>Connect your GitHub account and select this repository</li>
    <li>Configure build settings:
      <ul>
        <li>Build command: <code>yarn build</code></li>
        <li>Build output directory: <code>dist</code></li>
        <li>Root directory (Advanced) -> Path: <code>frontend</code></li>
      </ul>
    </li>
    <li>Configure environment variables:
      <ul>
        <li><code>VITE_API_BASE_URL</code>: Your Worker API base URL (e.g., <code>https://api.mdzz.uk</code>)</li>
         <li><code>VITE_EMAIL_DOMAIN</code>: Your domain list, separated by ',' (e.g., <code>mdzz.uk,zaunist.com</code>)</li>
      </ul>
    </li>
    <li>Click "Save and Deploy"</li>
  </ol>
</div>

---

## 💻 Local Development

### 🎨 Frontend Development

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install

# Start development server
yarn dev
```

</div>

### ⚙️ Worker Development

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">

```bash
# Navigate to worker directory
cd worker

# Install dependencies
yarn install

# Build preview
yarn build

# Deploy to Cloudflare
yarn deploy
```

</div>

---

## 🔧 Tech Stack

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
  <div>
    <h3>🎨 Frontend</h3>
    <ul>
      <li><strong>React</strong> - UI library</li>
      <li><strong>TypeScript</strong> - Type-safe JavaScript</li>
      <li><strong>Tailwind CSS</strong> - Utility-first CSS framework</li>
      <li><strong>Vite</strong> - Modern frontend build tool</li>
    </ul>
  </div>
  <div>
    <h3>⚙️ Backend</h3>
    <ul>
      <li><strong>Cloudflare Workers</strong> - Edge computing platform</li>
      <li><strong>Cloudflare D1</strong> - Edge SQL database</li>
      <li><strong>Cloudflare Email Workers</strong> - Email processing service</li>
    </ul>
  </div>
</div>

---

## 👥 Contributing

Contributions via Pull Requests or Issues are welcome!

## ⭐ Support This Project

<div align="center">
  <p>If this project has been helpful to you, or if you like it, please give it a Star ⭐️</p>
  <p>Your support motivates me to make continuous improvements!</p>
  
  <a href="https://github.com/zaunist/zmail">
    <img src="https://img.shields.io/github/stars/zaunist/zmail?style=social" alt="GitHub stars" />
  </a>
</div>

## 📄 License

[MIT License](./LICENSE) 