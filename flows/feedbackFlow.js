const messengerClient = require('../services/messengerClient');
const { getFeedbackImages } = require('../cloudinaryService');

async function sendFeedbackFlow(sender_psid, type) {
  console.log("🚀 Trigger Feedback Flow:", type);

  await messengerClient.sendMessage(sender_psid, {
    text: "Dạ em gửi chị một số hình ảnh khách hàng đã thực hiện tại phòng khám ạ"
  });

  const feedbackImages = await getFeedbackImages(type);
  const maxImages = 7;
  
  for (let i = 0; i < Math.min(feedbackImages.length, maxImages); i++) {
    await messengerClient.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: feedbackImages[i], is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  await messengerClient.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

module.exports = sendFeedbackFlow;