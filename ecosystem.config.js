module.exports = {
  apps: [
    {
      name: "firstServer",
      script: "./server.js",
      max_memory_restart: "1G",
      cron_restart: "0 */24 * * *",
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      max_restarts: 16, 
    },
  ],
};
