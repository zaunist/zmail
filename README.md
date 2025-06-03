# <div align="center">🚀 ZMAIL - 24小时临时邮箱服务</div>

<div align="center">
  <p>
    <a href="./README.en.md">English</a> | <strong>简体中文</strong>
  </p>

  <p>如果这个项目对您有帮助，请考虑给它一个 ⭐️ Star ⭐️，这将是对我最大的鼓励！</p>
  
  <img src="frontend/public/favicon.svg" alt="ZMAIL Logo" width="120" height="120" style="background-color: #4f46e5; padding: 20px; border-radius: 12px; margin: 20px 0;">
  
  <h3>💌 安全、简单、即用即走的临时邮箱服务</h3>

  <p>
    <a href="https://mail.mdzz.uk" target="_blank"><strong>🌐 在线体验</strong></a> •
    <a href="#功能特点"><strong>✨ 功能特点</strong></a> •
    <a href="#快速部署"><strong>🚀 快速部署</strong></a> •
    <a href="#本地开发"><strong>💻 本地开发</strong></a> •
    <a href="#技术栈"><strong>🔧 技术栈</strong></a>
  </p>
  
  <div style="display: flex; gap: 10px; justify-content: center; margin: 25px 0;">
    <a href="https://dash.cloudflare.com/" target="_blank">
      <img src="https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare" />
    </a>
  </div>
</div>

---

## 📹 视频教程

<div align="center">
  <a href="https://youtu.be/domoWldyXrc?si=9l3JN5AbtiaTS3_L" target="_blank">
    <img src="https://img.shields.io/badge/观看_YouTube_视频教程-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube 视频教程" width="250" />
  </a>
</div>

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <p>📺 完整视频教程包含以下内容：</p>
  <ol>
    <li>项目介绍与功能演示</li>
    <li>前端部署到 Cloudflare Pages 的详细步骤</li>
    <li>后端部署到 Cloudflare Workers 的详细步骤</li>
    <li>配置 Cloudflare Email 路由</li>
    <li>设置环境变量与数据库</li>
  </ol>
  <p>👉 <a href="https://youtu.be/domoWldyXrc?si=9l3JN5AbtiaTS3_L" target="_blank" style="color: #4f46e5;">点击此处观看完整视频教程</a></p>
</div>

---

## ✨ 功能特点

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0;">
  <div>
    <h4>✨ 即时创建</h4>
    <p>无需注册，立即获得一个临时邮箱地址</p>
  </div>
  <div>
    <h4>🔒 隐私保护</h4>
    <p>保护您的真实邮箱，避免垃圾邮件和信息泄露</p>
  </div>
  <div>
    <h4>⚡ 高速接收</h4>
    <p>实时接收邮件，无需刷新页面</p>
  </div>
  <div>
    <h4>🌐 全球可用</h4>
    <p>基于Cloudflare构建，全球边缘网络加速</p>
  </div>
  <div>
    <h4>🔄 自动刷新</h4>
    <p>自动检查新邮件，确保不错过任何重要信息</p>
  </div>
  <div>
    <h4>📱 响应式设计</h4>
    <p>完美适配各种设备，从手机到桌面</p>
  </div>
</div>

---

## 🚀 快速部署

ZMAIL 由前端和后端两部分组成，需要先部署后端，然后再部署前端：

### ⚙️ 后端部署步骤

<div align="center">
  <h3>2️⃣ 部署后端到 Cloudflare Workers</h3>
  <a href="https://dash.cloudflare.com/?to=/:account/workers/new" target="_blank">
    <img src="https://img.shields.io/badge/部署后端到_Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Deploy Backend to Cloudflare Workers" width="300" />
  </a>
</div>

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <ol>
    <li>点击"部署后端到 Cloudflare Workers"按钮</li>
    <li>连接您的GitHub账户并选择导入此仓库</li>
    <li>设置构建配置:
      <ul>
        <li>部署命令: <code>yarn deploy</code></li>
        <li>高级设置 -> 根目录: <code>/worker</code></li>
      </ul>
    </li>
    <li>配置D1数据库:
      <ul>
        <li>创建一个D1数据库 (例如: <code>mail_db</code>)</li>
        <li>将其绑定到您的Worker (绑定名称: <code>DB</code>)</li>
      </ul>
    </li>
    <li>配置Email路由:
      <ul>
        <li>在Cloudflare控制面板中设置Email路由，将邮件转发到您的Worker</li>
        <li>如果你想配置多个域名邮箱，那么就在CloudFlare后台将每一个域名都设置邮件转发到上述 worker 中</li>
      </ul>
    </li>
    <li>点击"部署"</li>
  </ol>
</div>

---

### 🖥️ 前端部署步骤

<div align="center">
  <h3>1️⃣ 部署前端到 Cloudflare Pages</h3>
  <a href="https://dash.cloudflare.com/?to=/:account/pages/new/import-git" target="_blank">
    <img src="https://img.shields.io/badge/部署前端到_Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Deploy Frontend to Cloudflare Pages" width="300" />
  </a>
</div>

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <ol>
    <li>点击"部署前端到 Cloudflare Pages"按钮</li>
    <li>连接您的GitHub账户并选择导入此仓库</li>
    <li>设置构建配置:
      <ul>
        <li>构建命令: <code>yarn build</code></li>
        <li>构建输出目录: <code>dist</code></li>
        <li>根目录（高级）-> 路径: <code>frontend</code></li>
      </ul>
    </li>
    <li>配置环境变量:
      <ul>
        <li><code>VITE_API_BASE_URL</code>: 您的Worker API基础URL (例如: <code>https://api.mdzz.uk</code>)</li>
         <li><code>VITE_EMAIL_DOMAIN</code>: 您的域名列表，使用','分割 (例如: <code>mdzz.uk,zaunist.com</code>)</li>
      </ul>
    </li>
    <li>点击"保存并部署"</li>
  </ol>
</div>


## 💻 本地开发

### 🎨 前端开发

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">

```bash
# 进入前端目录
cd frontend

# 安装依赖
yarn install

# 启动开发服务器
yarn dev
```

</div>

### ⚙️ Worker开发

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">

```bash
# 进入worker目录
cd worker

# 安装依赖
yarn install

# 构建预览
yarn build

# 部署到 cloudflare
yarn deploy
```

</div>

---

## 🔧 技术栈

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
  <div>
    <h3>🎨 前端</h3>
    <ul>
      <li><strong>React</strong> - 用户界面库</li>
      <li><strong>TypeScript</strong> - 类型安全的JavaScript超集</li>
      <li><strong>Tailwind CSS</strong> - 实用优先的CSS框架</li>
      <li><strong>Vite</strong> - 现代前端构建工具</li>
    </ul>
  </div>
  <div>
    <h3>⚙️ 后端</h3>
    <ul>
      <li><strong>Cloudflare Workers</strong> - 边缘计算平台</li>
      <li><strong>Cloudflare D1</strong> - 边缘SQL数据库</li>
      <li><strong>Cloudflare Email Workers</strong> - 邮件处理服务</li>
    </ul>
  </div>
</div>

---

## 👥 贡献指南

欢迎提交Pull Request或Issue来改进这个项目！

## ⭐ 支持项目

<div align="center">
  <p>如果您觉得这个项目对您有所帮助，或者您喜欢这个项目，请给它一个 Star ⭐️</p>
  <p>您的支持是我持续改进的动力！</p>
  
  <a href="https://github.com/zaunist/zmail">
    <img src="https://img.shields.io/github/stars/zaunist/zmail?style=social" alt="GitHub stars" />
  </a>
  
  <p style="margin-top: 15px;">
    <a href="https://tiny-bush-0bef.realyourdad.workers.dev/" target="_blank">
      <img src="https://img.shields.io/badge/Buy_Me_A_Coke-FF5E5B?style=for-the-badge&logo=coca-cola&logoColor=white" alt="Buy Me A Coke" width="200" style="border-radius: 8px;" height="51" />
    </a>
  </p>
</div>

## 📄 许可证

[MIT License](./LICENSE)