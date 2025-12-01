#!/usr/bin/env node

/**
 * Simple HTTP proxy that forwards requests from port 8081 to port 8080
 * This is needed because ReactHost (new architecture) hardcodes port 8081
 * and uses 10.0.2.2:8081, which bypasses adb reverse port forwarding
 * 
 * Usage: node proxy-8081-to-8080.js
 * 
 * Note: This will conflict with iOS bundler (which also uses port 8081)
 * You cannot run Android and iOS host bundlers simultaneously with this proxy.
 */

const http = require('http');

const PROXY_PORT = 8081;
const TARGET_PORT = 8080;
const TARGET_HOST = 'localhost';

const server = http.createServer((req, res) => {
  const targetUrl = `http://${TARGET_HOST}:${TARGET_PORT}${req.url}`;
  
  console.log(`[PROXY] ${req.method} ${req.url} -> ${targetUrl}`);
  
  const proxyReq = http.request(targetUrl, {
    method: req.method,
    headers: req.headers,
  }, (proxyRes) => {
    // Copy response headers
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    // Pipe response data
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`[PROXY ERROR]`, err.message);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: ' + err.message);
  });

  // Pipe request data
  req.pipe(proxyReq);
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`[PROXY] Listening on port ${PROXY_PORT}, forwarding to http://${TARGET_HOST}:${TARGET_PORT}`);
  console.log(`[PROXY] This allows ReactHost to connect to 10.0.2.2:8081, which will be forwarded to localhost:8080`);
  console.log(`[PROXY] ⚠️  WARNING: This will conflict with iOS bundler (port 8081).`);
  console.log(`[PROXY] ⚠️  You cannot run Android and iOS host bundlers simultaneously with this proxy.`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[PROXY ERROR] Port ${PROXY_PORT} is already in use. Is iOS bundler running?`);
    console.error(`[PROXY ERROR] You cannot run Android and iOS host bundlers simultaneously with this proxy.`);
    console.error(`[PROXY ERROR] Solution: Stop iOS bundler, or use a different approach.`);
  } else {
    console.error(`[PROXY ERROR]`, err);
  }
  process.exit(1);
});

