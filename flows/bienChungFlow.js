const messengerClient = require('../services/messengerClient');

async function sendBienChungFlow(sender_psid) {
  console.log("🚀 Trigger Biến Chứng Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `dạ với trường hợp của chị, chi phí chính xác trợ lý bác - bạn Ngân sẽ gởi sau khi xem hình ảnh, thông tin và trao đổi với bác về phương pháp thẩm mỹ cho chị. 
Hiện bác đã "giải cứu" tổng hơn 5000 ca mắt - mũi - ngực khách hàng làm ở các TMV khác bị lỗi, xấu.

Chị để lại số điện thoại, bạn Ngân sẽ trao đổi qua Zalo/Viber của chị trước ạ!`
  });
}

module.exports = sendBienChungFlow;