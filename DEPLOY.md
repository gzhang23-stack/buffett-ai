# 部署指南

## 方案一：使用 Vercel + 自定义域名（推荐）

### 步骤：

1. **部署到 Vercel**
   - 访问：https://vercel.com
   - 使用 GitHub 账号登录
   - 点击 "Add New Project"
   - 导入仓库：`gzhang23-stack/buffett-ai`
   - 框架会自动检测为 Next.js
   - 点击 "Deploy" 开始部署

2. **配置环境变量**（可选，用于 AI 问答功能）
   - 在项目设置中添加环境变量：
   ```
   DEEPSEEK_API_KEY=your-api-key
   ```
   - 保存后重新部署

3. **绑定自定义域名**
   - 在 Vercel 项目设置中点击 "Domains"
   - 添加你的域名（例如：buffett.yourdomain.com）
   - 按照提示配置 DNS 记录：
     - 类型：CNAME
     - 名称：buffett（或你的子域名）
     - 值：cname.vercel-dns.com

4. **配置国内 CDN 加速**（可选，提升国内访问速度）
   - 使用腾讯云 CDN 或阿里云 CDN
   - 源站地址填写你的 Vercel 域名
   - 配置 CNAME 到 CDN 提供的域名

5. **自动部署**
   - 推送代码到 GitHub 后会自动触发部署
   - 也可以在 Vercel 控制台手动触发部署

---

## 方案二：使用腾讯云 Webify（已停止新建）

### 步骤：

1. **登录腾讯云控制台**
   - 访问：https://console.cloud.tencent.com/webify
   - 如果没有开通，先开通 Webify 服务

2. **创建应用**
   - 点击"新建应用"
   - 选择"导入已有项目"
   - 授权 Gitee 账号
   - 选择 `buffett-ai` 仓库
   - 选择 `main` 分支

3. **配置构建**
   - 框架预设：Next.js
   - 构建命令：`npm run build`
   - 输出目录：`.next`
   - 安装命令：`npm install`
   - 启动命令：`npm run start`
   - Node 版本：18.x

4. **环境变量**（如果需要）
   ```
   NODE_ENV=production
   ```

5. **部署**
   - 点击"部署"按钮
   - 等待构建完成（约3-5分钟）
   - 获取访问域名

6. **绑定自定义域名**（可选）
   - 在应用设置中添加自定义域名
   - 配置 DNS 解析到腾讯云提供的 CNAME

---

## 方案二：使用腾讯云服务��（CVM）

### 前置要求：
- 一台腾讯云服务器（推荐 2核4G 以上）
- 已安装 Docker 和 Docker Compose

### 部署步骤：

1. **登录服务器**
   ```bash
   ssh root@your-server-ip
   ```

2. **克隆代码**
   ```bash
   git clone https://gitee.com/gzhang23/buffett-ai.git
   cd buffett-ai
   ```

3. **使用 Docker 部署**
   ```bash
   # 构建镜像
   docker build -t buffett-ai .
   
   # 运行容器
   docker run -d \
     --name buffett-ai \
     -p 3000:3000 \
     --restart always \
     buffett-ai
   ```

4. **配置 Nginx 反向代理**（可选）
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **配置 SSL 证书**（推荐）
   ```bash
   # 使用 certbot 自动配置
   certbot --nginx -d your-domain.com
   ```

---

## 方案三：使用 PM2 部署（轻量级）

### 步骤：

1. **安装 Node.js 和 PM2**
   ```bash
   # 安装 Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # 安装 PM2
   npm install -g pm2
   ```

2. **克隆并构建项目**
   ```bash
   git clone https://gitee.com/gzhang23/buffett-ai.git
   cd buffett-ai
   npm install
   npm run build
   ```

3. **使用 PM2 启动**
   ```bash
   pm2 start npm --name "buffett-ai" -- start
   pm2 save
   pm2 startup
   ```

4. **查看状态**
   ```bash
   pm2 status
   pm2 logs buffett-ai
   ```

---

## 更新部署

### Webify 自动部署：
- 推送代码到 Gitee 后会自动触发部署

### 手动更新（服务器部署）：
```bash
cd buffett-ai
git pull origin main
npm install
npm run build

# Docker 方式
docker stop buffett-ai
docker rm buffett-ai
docker build -t buffett-ai .
docker run -d --name buffett-ai -p 3000:3000 --restart always buffett-ai

# PM2 方式
pm2 restart buffett-ai
```

---

## 常见问题

### 1. 构建失败
- 检查 Node.js 版本是否为 18.x
- 确保 `data` 目录下的 JSON 文件存在

### 2. 端口被占用
```bash
# 查看端口占用
lsof -i :3000
# 或
netstat -tulpn | grep 3000
```

### 3. 内存不足
- 增加服务器内存
- 或使用 swap 分区

---

## 性能优化建议

1. **启用 CDN**
   - 将静态资源托管到腾讯云 COS
   - 配置 CDN 加速

2. **启用缓存**
   - 配置 Redis 缓存
   - 使用 Next.js ISR（增量静态再生成）

3. **监控和日志**
   - 使用腾讯云监控服务
   - 配置日志收集和告警
