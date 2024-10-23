import { API_URL } from './config/api'

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/opensearch',
    createProxyMiddleware({
      target: API_URL,
      changeOrigin: true,
      secure: false,  // Ignore SSL certificate errors
      pathRewrite: {
        '^/opensearch': ''
      },
      onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      }
    })
  );
};