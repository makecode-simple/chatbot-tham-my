const messengerClient = require('../services/messengerClient');
const { getBangGiaImage } = require('../cloudinaryService');

async function sendHoiGiaFlow(sender_psid) {
  console.log("🚀 Trigger Hỏi Giá Flow");
  
  const bangGiaImage = await getBangGiaImage('banggia_cacdichvu');
  if (bangGiaImage) {
    await messengerClient.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }
}

async function sendGiaMatFlow(sender_psid) {
  console.log("🚀 Trigger Giá Mắt Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ chi phí sửa lại mắt từng thẩm mỹ bị lỗi từ 35-65 triệu tùy trường hợp.`
  });

  await messengerClient.sendMessage(sender_psid, {
    text: "Chị cho em xin số điện thoại Zalo/Viber bạn Ngân trợ lý bác Vũ sẽ liên hệ tư vấn chuyên sâu hơn ạ"
  });
}

async function sendGiaCamFlow(sender_psid) {
  console.log("🚀 Trigger Giá Cằm Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Chi phí thẩm mỹ cằm sẽ từ 30-40 triệu tùy cấu trúc giải phẫu ạ`
  });

  await messengerClient.sendMessage(sender_psid, {
    text: "Chị cho em xin số điện thoại Zalo/Viber bạn Ngân trợ lý bác Vũ sẽ liên hệ tư vấn chuyên sâu hơn ạ"
  });
}

module.exports = {
  sendHoiGiaFlow,
  sendGiaMatFlow,
  sendGiaCamFlow
};