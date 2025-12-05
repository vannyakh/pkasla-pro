/**
 * PM2 Ecosystem Configuration
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 restart ecosystem.config.js
 *   pm2 stop ecosystem.config.js
 *   pm2 delete ecosystem.config.js
 */

module.exports = {
  apps: [
    {
      name: 'backend',
      script: './apps/backend/dist/server.js',
      cwd: process.cwd(),
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
    {
      name: 'web',
      script: './apps/web/.next/standalone/apps/web/server.js',
      cwd: process.cwd(),
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
    // Development instances (optional, for dev server)
    // {
    //   name: 'backend-dev',
    //   script: './apps/backend/dist/server.js',
    //   cwd: process.cwd(),
    //   instances: 1,
    //   exec_mode: 'fork',
    //   watch: false,
    //   max_memory_restart: '1G',
    //   env: {
    //     NODE_ENV: 'development',
    //     PORT: 4001,
    //   },
    //   error_file: './logs/backend-dev-error.log',
    //   out_file: './logs/backend-dev-out.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    //   merge_logs: true,
    //   autorestart: true,
    //   max_restarts: 10,
    //   min_uptime: '10s',
    // },
    // {
    //   name: 'web-dev',
    //   script: './apps/web/.next/standalone/apps/web/server.js',
    //   cwd: process.cwd(),
    //   instances: 1,
    //   exec_mode: 'fork',
    //   watch: false,
    //   max_memory_restart: '1G',
    //   env: {
    //     NODE_ENV: 'development',
    //     PORT: 3001,
    //   },
    //   error_file: './logs/web-dev-error.log',
    //   out_file: './logs/web-dev-out.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    //   merge_logs: true,
    //   autorestart: true,
    //   max_restarts: 10,
    //   min_uptime: '10s',
    // },
  ],
};

