const messengerClient = require('../services/messengerClient');
const { getFeedbackImages, getBangGiaImage } = require('../cloudinaryService');

async function sendNangNgucFlow(sender_psid) {
  console.log("🚀 Trigger Nâng Ngực Flow");
  
  // Send initial message
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ với hơn 10 năm kinh nghiệm, thẩm mỹ hơn 5000 ca mắt - mũi - ngực, chị yên tâm Bác sẽ đưa ra giải pháp tốt nhất phù hợp với cơ địa và mong muốn của chị.\n\nBên em áp dụng công nghệ Nâng ngực nội soi 4.0 với ưu điểm:\n1. Không đau\n2. Không gây chảy máu\n3. Không tiết dịch\n4. Không gây co thắt bao xơ\n5. Không cần nghỉ dưỡng\n6. Không để lại sẹo`
  });

  // Wait 1 second before sending images
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Send feedback images with delay between each
  const feedbackImages = await getFeedbackImages("nguc");
  const maxImages = 7; // Limit number of images
  
  for (let i = 0; i < Math.min(feedbackImages.length, maxImages); i++) {
    await messengerClient.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: feedbackImages[i], is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s delay between images
  }

  // Wait before sending price
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Send price image if available
  const bangGiaImage = await getBangGiaImage("banggia_nangnguc");
  if (bangGiaImage) {
    await messengerClient.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  // Final message after 1 second
  await new Promise(resolve => setTimeout(resolve, 1000));
  await messengerClient.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

module.exports = sendNangNgucFlow;