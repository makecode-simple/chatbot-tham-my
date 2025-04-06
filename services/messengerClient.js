const axios = require('axios');

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
      
      console.log('Gửi tin nhắn thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending message:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new MessengerClient();