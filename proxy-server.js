// 简单的CORS代理服务器，用于生产环境
// 使用方法: node proxy-server.js

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3001;

// 启用CORS
app.use(cors());

// 通义千问API代理
app.use('/api/tongyi', createProxyMiddleware({
  target: 'https://dashscope.aliyuncs.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/tongyi': '', // 移除 /api/tongyi 前缀
  },
  onProxyReq: (proxyReq, req, res) => {
    // 添加必要的headers
    proxyReq.setHeader('Accept', 'application/json');
  },
}));

app.listen(PORT, () => {
  console.log(`CORS代理服务器运行在端口 ${PORT}`);
  console.log(`前端应用可以通过 http://your-domain:${PORT}/api/tongyi 调用通义千问API`);
});