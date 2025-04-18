const messengerClient = require('../services/messengerClient');
const { getFeedbackImages } = require('../cloudinaryService');

async function sendImageAndAskContact(sender_psid, folder) {
  console.log(`🚀 Sending feedback images from ${folder}`);
  
  const images = await getFeedbackImages(folder);
  if (images && images.length > 0) {
    // Gửi tối đa 3 ảnh feedback
    for (let i = 0; i < Math.min(3, images.length); i++) {
      await messengerClient.sendMessage(sender_psid, {
        attachment: { type: 'image', payload: { url: images[i], is_reusable: true } }
      });
    }

    await messengerClient.sendMessage(sender_psid, {
      text: "Chị cho em xin số điện thoại, bạn Ngân trợ lý bác Vũ tư vấn chuyên sâu cho chị được không ạ?"
    });
  }
}

async function sendAnhNgucFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'nguc');
}

async function sendAnhMatFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'mat');
}

async function sendAnhMuiFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'mui');
}

async function sendAnhMongFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'mong');
}

async function sendAnhVungKinFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'vungkin');
}

async function sendAnhHutMoFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'hutmo');
}

async function sendAnhVuFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'nguc');
}

async function sendAnhDaFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'da');
}

async function sendAnhSaTreFlow(sender_psid) {
  await sendImageAndAskContact(sender_psid, 'satre');
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
