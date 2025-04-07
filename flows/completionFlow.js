const messengerClient = require('../services/messengerClient');

async function sendCompletionWarning(sender_psid) {
  await messengerClient.sendMessage(sender_psid, {
    text: `https://www.facebook.com/106197712068075/posts/352369154209319

Hiện nay tình trạng giả Ultrasonic Surgical Scalpel rất nhiều, chị tham khảo thêm bài viết để lấy kinh nghiệm cho bản thân nhé ạ!`
  });
}

module.exports = sendCompletionWarning;