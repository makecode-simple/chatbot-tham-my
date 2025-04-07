const axios = require('axios');
const logger = require('./loggingService');
const fs = require('fs');
const path = require('path');

class MessengerClient {
  constructor() {
    this.pageAccessToken = process.env.PAGE_ACCESS_TOKEN;
    this.apiVersion = 'v18.0';
    this.baseURL = `https://graph.facebook.com/${this.apiVersion}/me/messages`;
  }

  async sendMessage(recipient_id, message) {
    try {
      const response = await axios.post(this.baseURL, {
        recipient: { id: recipient_id },
        message: message
      }, {
        params: { access_token: this.pageAccessToken }
      });

      // Log chỉ những thông tin cần thiết cho training
      await logger.logInteraction({
        sender_psid: recipient_id,
        userMessage: message.text,
        intent: message.intent || null,
        timestamp: new Date()
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error sending message:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Trong hàm xử lý message
// In handleMessage function, add logging
async function handleMessage(sender_psid, received_message) {
  // ... xử lý message như cũ ...
}
module.exports = new MessengerClient();