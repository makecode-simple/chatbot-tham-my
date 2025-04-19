const messengerClient = require('../services/messengerClient');

async function sendFaqSizeTuiFlow(sender_psid) {
  console.log("🚀 Trigger FAQ Size Túi Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ chào chị, về size và form túi thì bác Vũ sẽ tư vấn khi chị đến khám trực tiếp để đảm bảo túi phù hợp cấu trúc giải phẫu và mong muốn của chị ạ.`
  });
}

module.exports = {
  sendFaqSizeTuiFlow
};