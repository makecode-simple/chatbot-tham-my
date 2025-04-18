const messengerClient = require('../services/messengerClient');
const { getBangGiaImage } = require('../cloudinaryService');

async function sendHoiGiaFlow(sender_psid) {
  console.log("🚀 Trigger Hỏi Giá Flow");
  
  const bangGiaImage = await getBangGiaImage('banggia_nangngucc');
  if (bangGiaImage) {
    await messengerClient.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });

    await messengerClient.sendMessage(sender_psid, {
      text: "Chị đang quan tâm dịch vụ nào ạ?"
    });
  }
}

async function sendGiaMatFlow(sender_psid) {
  console.log("🚀 Trigger Giá Mắt Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ chi phí sửa lại mắt từng thẩm mỹ bị lỗi từ 35-65 triệu tùy trường hợp.`
  });

  await messengerClient.sendMessage(sender_psid, {
    text: "Chị cho em xin số điện thoại, bạn Ngân trợ lý bác Vũ tư vấn chuyên sâu cho chị được không ạ?"
  });
}

async function sendGiaCamFlow(sender_psid) {
  console.log("🚀 Trigger Giá Cằm Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Chi phí thẩm mỹ cằm sẽ từ 30-40 triệu tùy cấu trúc giải phẫu ạ`
  });

  await messengerClient.sendMessage(sender_psid, {
    text: "Chị cho em xin số điện thoại, bạn Ngân trợ lý bác Vũ tư vấn chuyên sâu cho chị được không ạ?"
  });
}

async function sendGiaNgucFlow(sender_psid) {
  console.log("🚀 Trigger Giá Ngực Flow");
  
  const bangGiaNgucImage = await getBangGiaImage('banggia_nangngucc');
  if (bangGiaNgucImage) {
    await messengerClient.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaNgucImage, is_reusable: true } }
    });

    await messengerClient.sendMessage(sender_psid, {
      text: "Chị cho em xin số điện thoại, bạn Ngân trợ lý bác Vũ tư vấn chuyên sâu cho chị được không ạ?"
    });
  }
}

async function sendGiaMongFlow(sender_psid) {
  console.log("🚀 Trigger Giá Mông Flow");
  
  const bangGiaMongImage = await getBangGiaImage('banggia_cacdichvukhac');
  if (bangGiaMongImage) {
    await messengerClient.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaMongImage, is_reusable: true } }
    });

    await messengerClient.sendMessage(sender_psid, {
      text: "Chị cho em xin số điện thoại, bạn Ngân trợ lý bác Vũ tư vấn chuyên sâu cho chị được không ạ?"
    });
  }
}

async function sendGiaMuiFlow(sender_psid) {
  console.log("🚀 Trigger Giá Mũi Flow");
  
  const bangGiaMuiImage = await getBangGiaImage('banggia_thammymui');
  if (bangGiaMuiImage) {
    await messengerClient.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaMuiImage, is_reusable: true } }
    });

    await messengerClient.sendMessage(sender_psid, {
      text: "Chị cho em xin số điện thoại, bạn Ngân trợ lý bác Vũ tư vấn chuyên sâu cho chị được không ạ?"
    });
  }
}

module.exports = {
  sendHoiGiaFlow,
  sendGiaMatFlow,
  sendGiaCamFlow,
  sendGiaNgucFlow,
  sendGiaMongFlow,
  sendGiaMuiFlow
};