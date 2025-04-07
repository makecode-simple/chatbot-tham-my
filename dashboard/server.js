const express = require('express');
const analyzeConversations = require('../scripts/analyzeConversations');
const app = express();

app.get('/', (req, res) => {
  const report = analyzeConversations();
  res.send(`
    <html>
      <head>
        <title>Chatbot Analytics</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          .card { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>📊 Chatbot Analytics Dashboard</h1>
        
        <div class="card">
          <h3>Tổng quan</h3>
          <p>Số cuộc hội thoại: ${report.totalConversations}</p>
          <p>Số người dùng: ${report.summary.totalUsers}</p>
          <p>Tỷ lệ chuyển đổi: ${report.summary.conversionRate}</p>
        </div>

        <div class="card">
          <h3>Top Dịch vụ được quan tâm</h3>
          <ul>
            ${report.summary.mostPopularServices
              .map(([service, count]) => `<li>${service}: ${count} lượt</li>`)
              .join('')}
          </ul>
        </div>

        <div class="card">
          <h3>Câu hỏi chưa hiểu</h3>
          <ul>
            ${report.failedIntents
              .slice(0, 5)
              .map(q => `<li>${q}</li>`)
              .join('')}
          </ul>
        </div>
      </body>
    </html>
  `);
});

app.listen(3002, () => {
  console.log('Dashboard running at http://localhost:3002');
});