const messengerClient = require('../services/messengerClient');
const { getFeedbackImages, getBangGiaImage } = require('../cloudinaryService');

async function sendDonCamFlow(sender_psid) {
  console.log("🚀 Trigger Độn Cằm Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ với hơn 10 năm kinh nghiệm, thẩm mỹ hơn 5000 ca mắt - mũi - ngực, chị yên tâm Bác sẽ đưa ra giải pháp tốt nhất phù hợp với cơ địa và mong muốn của chị.\n\nƯu điểm công nghệ độn cằm của bác Vũ:\n1. Không đau\n2. Không để lại sẹo\n3. Phục hồi nhanh\n4. Dáng đẹp tự nhiên\n5. Kết quả vĩnh viễn\n6. Bảo hành trọn đời`
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  const feedbackImages = await getFeedbackImages("cam");
  const maxImages = 7;
  
  for (let i = 0; i < Math.min(feedbackImages.length, maxImages); i++) {
    await messengerClient.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: feedbackImages[i], is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  const bangGiaImage = await getBangGiaImage("banggia_doncam");
  if (bangGiaImage) {
    await messengerClient.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  await messengerClient.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

module.exports = {
  sendDonCamFlow
};
