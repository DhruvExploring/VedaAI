module.exports = {
  apps: [
    {
      name: 'veda-backend',
      script: 'backend/dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'veda-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: 'frontend',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};

