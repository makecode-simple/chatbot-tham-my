const analyzeConversations = require('./analyzeConversations');
const path = require('path');

function displayAnalytics() {
  const report = analyzeConversations();
  
  console.log('\n=== CHATBOT ANALYTICS REPORT ===\n');
  
  console.log('📊 Tổng quan:');
  console.log(`- Tổng số cuộc hội thoại: ${report.totalConversations}`);
  console.log(`- Số người dùng: ${report.summary.totalUsers}`);
  console.log(`- Tỷ lệ chuyển đổi: ${report.summary.conversionRate}`);
  
  console.log('\n🕒 Giờ cao điểm:');
  report.summary.peakHours.forEach(({hour, count}) => {
    console.log(`- ${hour}:00 - ${hour+1}:00: ${count} tin nhắn`);
  });
  
  console.log('\n🏆 Dịch vụ được quan tâm nhiều nhất:');
  report.summary.mostPopularServices.forEach(([service, count]) => {
    console.log(`- ${service}: ${count} lượt`);
  });
  
  console.log('\n❌ Top câu hỏi bot chưa hiểu:');
  report.failedIntents.slice(0, 5).forEach(question => {
    console.log(`- "${question}"`);
  });

  console.log('\nBáo cáo chi tiết được lưu tại:');
  console.log(path.join(__dirname, '../logs/conversations'));
}

// Chạy report
displayAnalytics();