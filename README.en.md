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

ZMAIL now adopts a brand new integrated deployment approach, with frontend and backend integrated into a single Cloudflare Worker, making deployment even simpler!

### 🎯 Deployment Options

We provide two deployment methods, you can choose according to your needs:

#### Option 1: One-Click Deployment (Recommended for Beginners)

<div align="center">
  <a href="http://deploy.workers.cloudflare.com/?url=https://github.com/zaunist/zmail" target="_blank">
    <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" />
  </a>
</div>

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <h4>✅ Advantages:</h4>
  <ul>
    <li>Simple deployment, one-click completion</li>
    <li>No need to modify configuration files</li>
    <li>Perfect for quick testing</li>
  </ul>
  
  <h4>❌ Disadvantages:</h4>
  <ul>
    <li>Cannot receive subsequent code updates</li>
    <li>Need to manually bind custom domain</li>
  </ul>
  
  <h4>📋 Deployment Steps:</h4>
  <ol>
    <li>Click the "Deploy to Cloudflare" button above</li>
    <li>Follow the page instructions to connect your GitHub account</li>
    <li>Fill in application name and database name</li>
    <li>In Advanced Settings -> Build Variables, set:
      <ul>
        <li><code>VITE_EMAIL_DOMAIN</code>: Your domain list, separated by ',' (e.g., mdzz.uk,zaunist.com)</li>
      </ul>
    </li>
    <li>Click "Create and Deploy"</li>
    <li>After deployment, bind custom domain in Cloudflare Workers dashboard</li>
    <li>Configure Cloudflare Email routing to forward emails to your Worker</li>
  </ol>
</div>

#### Option 2: Fork and Custom Deployment via Github Action (Recommended for Advanced Users)

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <h4>✅ Advantages:</h4>
  <ul>
    <li>Can receive subsequent code updates</li>
    <li>Fully customizable configuration</li>
    <li>Better version control</li>
    <li>Automatic deployment via GitHub Actions, more secure and convenient</li>
  </ul>
  
  <h4>❌ Disadvantages:</h4>
  <ul>
    <li>Requires some technical knowledge</li>
    <li>Need to manually create database and configure secrets</li>
  </ul>
  
  <h4>📋 Deployment Steps:</h4>
  <ol>
    <li>Fork this project to your GitHub account</li>
    <li>Create a D1 database in your Cloudflare Dashboard and note down the <strong>database_name</strong> and <strong>database_id</strong></li>
    <li>In your GitHub repository, go to <strong>Settings</strong> > <strong>Secrets and variables</strong> > <strong>Actions</strong></li>
    <li>Click <strong>New repository secret</strong> and add the following five secrets:
      <ul>
        <li><code>CF_API_TOKEN</code>: Your Cloudflare API Token. You can create one <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank">here</a> using the "Edit Cloudflare Workers" template.</li>
        <li><code>CF_ACCOUNT_ID</code>: Your Cloudflare Account ID. You can find it on the right side of the Workers page.</li>
        <li><code>D1_DATABASE_ID</code>: The ID of the D1 database you created in step 2.</li>
        <li><code>D1_DATABASE_NAME</code>: The name of the D1 database you created in step 2.</li>
        <li><code>VITE_EMAIL_DOMAIN</code>: Your list of domains, separated by commas (e.g., example.com,test.com).</li>
      </ul>
    </li>
    <li>After completing the steps above, the project will be automatically deployed on every push to the <code>main</code> branch. You can also trigger the deployment manually from the Actions page.</li>
    <li>After deployment, bind a custom domain to your Worker.</li>
    <li>Finally, configure Cloudflare Email Routing to forward emails to your Worker.</li>
  </ol>
</div>

### 📧 Configure Email Routing

Regardless of which deployment method you choose, you need to configure Cloudflare Email routing:

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <ol>
    <li>Find your domain in the Cloudflare dashboard</li>
    <li>Go to "Email" -> "Email Routing"</li>
    <li>Enable Email Routing</li>
    <li>Add routing rules:
      <ul>
        <li>Match type: "Catch-all address"</li>
        <li>Action: "Send to a Worker"</li>
        <li>Select your deployed Worker</li>
      </ul>
    </li>
    <li>If you have multiple domains, repeat the above steps for each domain</li>
  </ol>
</div>

---

## 💻 Local Development

### 🚀 Development

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">

```bash
# install dependencies
pnpm install

# start frontend development server
pnpm dev:frontend

# start backend development server
pnpm dev:backend
```

</div>

### ⚙️ Deployment

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">

```bash
# deploy
pnpm run deploy
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

## 📄 License

[MIT License](./LICENSE)
