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

module.exports = sendHoiGiaFlow;