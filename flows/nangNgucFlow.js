const messengerService = require('../messengerService');
const { getFeedbackImages, getBangGiaImage } = require('../cloudinaryService');

async function sendNangNgucFlow(sender_psid) {
  console.log("🚀 Trigger Nâng Ngực Flow");
  
  await messengerService.sendMessage(sender_psid, {
    text: `Dạ với hơn 10 năm kinh nghiệm, thẩm mỹ hơn 5000 ca mắt - mũi - ngực, chị yên tâm Bác sẽ đưa ra giải pháp tốt nhất phù hợp với cơ địa và mong muốn của chị.\n\n
Bên em áp dụng công nghệ Nâng ngực nội soi 4.0 với ưu điểm:\n
1. Không đau\n
2. Không gây chảy máu\n
3. Không tiết dịch\n
4. Không gây co thắt bao xơ\n
5. Không cần nghỉ dưỡng\n
6. Không để lại sẹo`
  });

  const feedbackImages = await getFeedbackImages("nguc");
  for (const url of feedbackImages) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url, is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const bangGiaImage = await getBangGiaImage("banggia_nangnguc");
  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

module.exports = sendNangNgucFlow;