const messengerClient = require('../services/messengerClient');
const { getFeedbackImages, getBangGiaImage } = require('../cloudinaryService');

async function sendNangMuiFlow(sender_psid) {
  console.log("🚀 Trigger Nâng Mũi Flow");
  
  // Send intro message
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ với hơn 10 năm kinh nghiệm, thẩm mỹ hơn 5000 ca mắt - mũi - ngực, chị yên tâm Bác sẽ đưa ra giải pháp tốt nhất phù hợp với cơ địa và mong muốn của chị.\n\nBên em áp dụng công nghệ nâng mũi cấu trúc với ưu điểm:\n1. Không đau\n2. Không để lại sẹo\n3. Dáng mũi tự nhiên\n4. Sử dụng sụn tự thân\n5. An toàn tuyệt đối\n6. Bảo hành trọn đời`
  });

  // Get all images first
  const feedbackImages = await getFeedbackImages("mui");
  const bangGiaImage = await getBangGiaImage("banggia_thammymui");
  
  // Send feedback images (max 7)
  const maxImages = 7;
  for (let i = 0; i < Math.min(feedbackImages.length, maxImages); i++) {
    await messengerClient.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: feedbackImages[i], is_reusable: true } }
    });
  }

  // Send price list image
  if (bangGiaImage) {
    await messengerClient.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  // Send final message
  await messengerClient.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

module.exports = {
  sendNangMuiFlow
};