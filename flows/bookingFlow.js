const messengerClient = require('../services/messengerClient');

async function sendBookingFlow(sender_psid) {
  console.log("🚀 Trigger Booking Flow");

  await messengerClient.sendMessage(sender_psid, {
    text: "Dạ để đặt lịch tư vấn chị cho em xin số điện thoại, zalo, viber Ngân trợ lý bác hỗ trợ chị đặt lịch ạ."
  });
}

module.exports = sendBookingFlow;