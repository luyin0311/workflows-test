# Hello Docker Full Stack

这是一个用于学习的最小前后端分离实践项目，覆盖了：

- 前端：原生 HTML / JavaScript + Nginx
- 后端：Node.js + Express
- 数据库：PostgreSQL
- 容器化：Docker + Docker Compose
- 镜像构建：GitHub Actions + GHCR

## 项目结构

```text
.
├── .github/workflows/docker.yml
├── backend
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── compose.yaml
├── frontend
│   ├── Dockerfile
│   ├── index.html
│   └── nginx.conf
└── README.md
```

## 启动项目

```bash
docker compose up --build
```

启动后访问：

- 前端页面：<http://localhost:8080>
- 后端健康检查：<http://localhost:3001/api/health>
- 后端留言列表：<http://localhost:3001/api/messages>

## 当前架构

- `frontend` 容器：Nginx 提供静态页面
- `backend` 容器：Express 提供 API，并连接 PostgreSQL
- `db` 容器：PostgreSQL 存储留言数据

## 你可以从这里学习什么

1. 前端如何跨端口调用后端 API
2. 后端如何独立提供 REST API
3. 后端如何连接 PostgreSQL 并初始化表结构
4. Dockerfile 如何分别打包前端和后端服务
5. Compose 如何编排三个服务并管理依赖
6. GitHub Actions 如何分别构建前端和后端镜像

## 下一步建议

- 给留言增加删除和编辑接口
- 把数据库密码改成 `.env`
- 给后端补充自动化测试
- 给前端增加独立样式文件和脚本文件
- 用反向代理统一前后端域名
