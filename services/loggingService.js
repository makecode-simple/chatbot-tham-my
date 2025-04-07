const fs = require('fs');
const path = require('path');

class ConversationLogger {
  constructor() {
    this.logPath = path.join(__dirname, '../logs/conversations');
    if (!fs.existsSync(this.logPath)) {
      fs.mkdirSync(this.logPath, { recursive: true });
    }
  }

  async logInteraction(data) {
    const {
      sender_psid,
      userMessage,
      intent,
      timestamp
    } = data;

    // Chỉ log nếu có user message (bỏ qua bot response)
    if (!userMessage) return;

    const logEntry = {
      m: userMessage,        // message
      i: intent,            // intent
      t: timestamp          // timestamp
    };

    const fileName = `${timestamp.toISOString().split('T')[0]}.json`;
    const filePath = path.join(this.logPath, fileName);

    try {
      let logs = [];
      if (fs.existsSync(filePath)) {
        logs = JSON.parse(fs.readFileSync(filePath));
      }
      logs.push(logEntry);
      fs.writeFileSync(filePath, JSON.stringify(logs));
    } catch (error) {
      console.error('Logging failed:', error);
    }
  }
}

module.exports = new ConversationLogger();