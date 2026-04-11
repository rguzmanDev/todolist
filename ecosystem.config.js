module.exports = {
  apps: [
    {
      name: 'folio',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: __dirname,
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
