const messengerService = require('../messengerService');
const { getFeedbackImages, getBangGiaImage } = require('../cloudinaryService');

async function sendThaoTuiNgucFlow(sender_psid) {
  console.log("🚀 Trigger Tháo Túi Ngực Flow");
  
  await messengerService.sendMessage(sender_psid, {
    text: `Dạ với hơn 10 năm kinh nghiệm, thẩm mỹ hơn 5000 ca mắt - mũi - ngực, chị yên tâm Bác sẽ đưa ra giải pháp tốt nhất phù hợp với cơ địa và mong muốn của chị.\n\n
Bên em áp dụng công nghệ tháo túi ngực nội soi với ưu điểm:\n
1. Không đau\n
2. Không để lại sẹo\n
3. Phục hồi nhanh\n
4. An toàn tuyệt đối`
  });

  const feedbackImages = await getFeedbackImages("thaotui");
  for (const url of feedbackImages) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url, is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const bangGiaImage = await getBangGiaImage("banggia_thaotui");
  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

module.exports = sendThaoTuiNgucFlow;