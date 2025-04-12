const axios = require('axios');
const logger = require('./loggingService');
const fs = require('fs');
const path = require('path');

class MessengerClient {
  constructor() {
    this.pageAccessToken = process.env.PAGE_ACCESS_TOKEN;
    this.apiVersion = 'v18.0';
    this.baseURL = `https://graph.facebook.com/${this.apiVersion}/me/messages`;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  async sendMessage(recipient_id, message) {
    let attempts = 0;
    while (attempts < this.retryAttempts) {
      try {
        const response = await axios.post(this.baseURL, {
          recipient: { id: recipient_id },
          message: message,
          messaging_type: 'RESPONSE'
        }, {
          params: { access_token: this.pageAccessToken }
        });

        await logger.logInteraction({
          sender_psid: recipient_id,
          userMessage: message.text,
          botResponse: message,
          intent: message.intent || null,
          timestamp: new Date()
        });

        return response.data;
      } catch (error) {
        attempts++;
        console.error(`❌ Attempt ${attempts} failed:`, error.response?.data || error.message);
        
        if (attempts === this.retryAttempts) {
          throw new Error(`Failed to send message after ${this.retryAttempts} attempts`);
        }
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
  }

  async sendTypingIndicator(recipient_id, duration = 2000) {
    try {
      // Send typing on
      await axios.post(this.baseURL, {
        recipient: { id: recipient_id },
        sender_action: 'typing_on'
      }, {
        params: { access_token: this.pageAccessToken }
      });

      // Wait for specified duration
      await new Promise(resolve => setTimeout(resolve, duration));

      // Send typing off
      await axios.post(this.baseURL, {
        recipient: { id: recipient_id },
        sender_action: 'typing_off'
      }, {
        params: { access_token: this.pageAccessToken }
      });
    } catch (error) {
      console.error('❌ Error managing typing indicator:', error.response?.data || error.message);
    }
  }

  async sendQuickReplies(recipient_id, text, quick_replies) {
    return this.sendMessage(recipient_id, {
      text: text,
      quick_replies: quick_replies.map(reply => ({
        content_type: 'text',
        title: reply,
        payload: reply.toLowerCase().replace(/ /g, '_')
      }))
    });
  }

  async sendTemplate(recipient_id, template) {
    return this.sendMessage(recipient_id, {
      attachment: {
        type: 'template',
        payload: template
      }
    });
  }

  async markSeen(recipient_id) {
    try {
      await axios.post(this.baseURL, {
        recipient: { id: recipient_id },
        sender_action: 'mark_seen'
      }, {
        params: { access_token: this.pageAccessToken }
      });
    } catch (error) {
      console.error('❌ Error marking message as seen:', error.response?.data || error.message);
    }
  }

  async getUserProfile(user_id) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.apiVersion}/${user_id}`,
        {
          params: {
            fields: 'first_name,last_name,profile_pic',
            access_token: this.pageAccessToken
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user profile:', error.response?.data || error.message);
      return null;
    }
  }
}

module.exports = new MessengerClient();