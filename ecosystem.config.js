module.exports = {
  apps: [
    {
      name: "backend-app", // Name of the app
      script: "./app.js", // Entry point of your application
      instances: 2, // Set to a fixed number or 'max' for all CPU cores
      exec_mode: "cluster", // Enables clustering (useful for multi-core systems)
      autorestart: true, // Automatically restart on crashes
      watch: false, // Disable watching in production
      max_memory_restart: "500M", // Restart if memory exceeds 500 MB
      log_date_format: "YYYY-MM-DD HH:mm Z", // Format log timestamps
      error_file: "./logs/err.log", // Path to error log
      out_file: "./logs/out.log", // Path to output log
      merge_logs: true, // Merge logs from all instances
    },
  ],
};
