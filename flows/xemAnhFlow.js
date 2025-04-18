const messengerClient = require('../services/messengerClient');
const { getBangGiaImage } = require('../cloudinaryService');

async function sendImageAndAskContact(sender_psid, imageId) {
  console.log(`🚀 Sending image ${imageId}`);
  
  const image = await getBangGiaImage(imageId);
  if (image) {
    await messengerClient.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: image, is_reusable: true } }
    });

    await messengerClient.sendMessage(sender_psid, {
      text: "Chị cho em xin số điện thoại, bạn Ngân trợ lý bác Vũ tư vấn chuyên sâu cho chị được không ạ?"
    });
  }
}

async function sendAnhNgucFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'anh_nguc');
}

async function sendAnhMatFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'anh_mat');
}

async function sendAnhMuiFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'anh_mui');
}

async function sendAnhMongFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'anh_mong');
}

async function sendAnhVungKinFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'anh_vungkin');
}

async function sendAnhHutMoFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'anh_hutmo');
}

async function sendAnhVuFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'anh_vu');
}

async function sendAnhDaFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'anh_da');
}

async function sendAnhSaTreFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'anh_satre');
}

module.exports = {
  sendAnhNgucFlow,
  sendAnhMatFlow,
  sendAnhMuiFlow,
  sendAnhMongFlow,
  sendAnhVungKinFlow,
  sendAnhHutMoFlow,
  sendAnhVuFlow,
  sendAnhDaFlow,
  sendAnhSaTreFlow
};
