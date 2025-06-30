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

</div>

---

## 📹 视频教程

1. **项目介绍与功能演示**
2. **一体化 Worker 部署到 Cloudflare 的详细步骤**
3. **Fork 项目并自定义配置的方法**
4. **配置 Cloudflare Email 路由**
5. **设置环境变量与 D1 数据库**

<div align="center">
  <a href="https://youtu.be/EHXijzlveqk" target="_blank">
    <img src="https://img.shields.io/badge/观看_YouTube_视频教程-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube 视频教程" />
  </a>
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

ZMAIL 现在采用全新的一体化部署方式，前端和后端整合为一个 Cloudflare Worker，部署更加简单！

### 🎯 部署方式选择

我们提供两种部署方式，您可以根据需求选择：

#### 方式一：一键部署（推荐新手）

<div align="center">
  <a href="http://deploy.workers.cloudflare.com/?url=https://github.com/zaunist/zmail" target="_blank">
    <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" />
  </a>
</div>

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <h4>✅ 优点：</h4>
  <ul>
    <li>部署简单，一键完成</li>
    <li>无需修改配置文件</li>
    <li>适合快速体验</li>
  </ul>
  
  <h4>❌ 缺点：</h4>
  <ul>
    <li>无法获得后续代码更新</li>
    <li>需要手动绑定自定义域名</li>
  </ul>
  
  <h4>📋 部署步骤：</h4>
  <ol>
    <li>点击上方 "Deploy to Cloudflare" 按钮</li>
    <li>按照页面提示连接您的 GitHub 账户</li>
    <li>填写应用名称和数据库名称</li>
    <li>在高级设置 -> 构建变量中设置：
      <ul>
        <li><code>VITE_EMAIL_DOMAIN</code>: 您的域名列表，使用 ',' 分割 (例如: mdzz.uk,zaunist.com)</li>
      </ul>
    </li>
    <li>点击"创建和部署"</li>
    <li>部署完成后，在 Cloudflare Workers 控制面板中绑定自定义域名</li>
    <li>配置 Cloudflare Email 路由，将邮件转发到您的 Worker</li>
  </ol>
</div>

#### 方式二：Fork 后自定义部署（推荐进阶用户）

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <h4>✅ 优点：</h4>
  <ul>
    <li>可以获得后续代码更新</li>
    <li>完全自定义配置</li>
    <li>更好的版本控制</li>
  </ul>
  
  <h4>❌ 缺点：</h4>
  <ul>
    <li>需要手动修改配置文件</li>
    <li>需要一定的技术基础</li>
    <li>需要手动创建数据库</li>
  </ul>
  
  <h4>📋 部署步骤：</h4>
  <ol>
    <li>Fork 本项目到您的 GitHub 账户</li>
    <li>在 Cloudflare Dashboard 中创建一个 D1 数据库，记住数据库的 name 和 id</li>
    <li>修改根目录下的 <code>wrangler.toml</code> 文件：
      <ul>
        <li>修改 <code>name</code> 为您的应用名称。（可选）</li>
        <li>修改 <code>routes</code> 中的自定义域名。（必须！默认的worker.dev域名在中国大陆无法访问）</li>
        <li>修改 <code>database_name</code> 和 <code>database_id</code> 为您的 D1 数据库信息。（必须！）</li>
        <li>修改 <code>VITE_EMAIL_DOMAIN</code> 为您的域名列表。（可选，只是方便网页上复制粘贴邮件地址使用，不设置也不影响接收邮件）</li>
      </ul>
    </li>
    <li>在 Cloudflare Dashboard 中选择 "Workers & Pages"</li>
    <li>点击 "Create application" -> "Pages" -> "Connect to Git"</li>
    <li>选择您 Fork 的仓库</li>
    <li>配置构建设置（通常会自动检测）</li>
    <li>点击 "Save and Deploy"</li>
    <li>配置 Cloudflare Email 路由，将邮件转发到您的 Worker</li>
  </ol>
</div>

### 📧 配置邮件路由

无论选择哪种部署方式，都需要配置 Cloudflare Email 路由：

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <ol>
    <li>在 Cloudflare 控制面板中找到您的域名</li>
    <li>进入 "Email" -> "Email Routing"</li>
    <li>启用 Email Routing</li>
    <li>添加路由规则：
      <ul>
        <li>匹配类型："Catch-all address"</li>
        <li>操作："Send to a Worker"</li>
        <li>选择您部署的 Worker</li>
      </ul>
    </li>
    <li>如果有多个域名，请为每个域名重复上述步骤</li>
  </ol>
</div>

---


## 💻 本地开发

### 🚀 开发

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">

```bash
# 安装依赖
pnpm install

# 启动前端开发服务器
pnpm dev:frontend

# 启动后端开发服务器
pnpm dev:backend
```

</div>

### ⚙️ 部署

<div style="background-color: #2d2d2d; color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">

```bash
# 部署
pnpm run deploy
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
    <a href="https://buymeacoke.realyourdad.workers.dev/" target="_blank">
      <img src="https://img.shields.io/badge/Buy_Me_A_Coke-FF5E5B?style=for-the-badge&logo=coca-cola&logoColor=white" alt="Buy Me A Coke" width="200" style="border-radius: 8px;" height="51" />
    </a>
  </p>
</div>

## 📄 许可证

[MIT License](./LICENSE)
