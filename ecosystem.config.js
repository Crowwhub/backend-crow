// PM2 process config for the NestJS backend.
//
// IMPORTANT: fork mode + a single instance. The chat feature uses socket.io;
// running multiple instances would require sticky sessions and a shared
// adapter (e.g. Redis). Keep instances: 1 unless that's set up.
module.exports = {
  apps: [
    {
      name: "crow-api",
      script: "dist/main.js",
      cwd: __dirname,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        // Secrets/connection strings are read from .env by Nest's ConfigModule
        // and Prisma at runtime — do not hardcode them here.
        PORT: 8080,
      },
    },
  ],
};
