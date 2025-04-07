const messengerClient = require('../services/messengerClient');
const { getFeedbackImages, getBangGiaImage } = require('../cloudinaryService');

async function sendCangDaMatFlow(sender_psid) {
  console.log("🚀 Trigger Căng Da Mặt Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ với hơn 10 năm kinh nghiệm, thẩm mỹ hơn 5000 ca mắt - mũi - ngực, chị yên tâm Bác sẽ đưa ra giải pháp tốt nhất phù hợp với cơ địa và mong muốn của chị.\n\nBên em áp dụng công nghệ căng da mặt Ultra V-Lift với ưu điểm:\n1. Không phẫu thuật\n2. Không để lại sẹo\n3. Không thời gian hồi phục\n4. Trẻ hoá toàn diện\n5. Hiệu quả tức thì\n6. Duy trì 3-5 năm`
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  const feedbackImages = await getFeedbackImages("damat");
  const maxImages = 7;
  
  for (let i = 0; i < Math.min(feedbackImages.length, maxImages); i++) {
    await messengerClient.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: feedbackImages[i], is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  const bangGiaImage = await getBangGiaImage("banggia_damat");
  if (bangGiaImage) {
    await messengerClient.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  await new Promise(resolve => setTimeout(resolve, 1000));
  await messengerClient.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

module.exports = sendCangDaMatFlow;