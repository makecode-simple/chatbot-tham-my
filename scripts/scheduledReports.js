const cron = require('node-cron');
const displayAnalytics = require('./viewAnalytics');

// Chạy report tự động mỗi ngày lúc 8h sáng
cron.schedule('0 8 * * *', () => {
  displayAnalytics();
});