const messengerClient = require('../services/messengerClient');

async function sendNoPhoneResponse(sender_psid) {
  console.log("🚀 Trigger No Phone Response Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ vậy chị cho em xin thông tin liên lạc hoặc nền tảng mạng xã hội nào mình đang sử dụng để Ngân trợ lý bác Vũ sẽ liên hệ tư vấn chuyên sâu hơn ạ`
  });
}

module.exports = {
  sendNoPhoneResponse
};
