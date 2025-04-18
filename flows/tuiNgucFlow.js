const messengerClient = require('../services/messengerClient');

async function sendLoaiTuiFlow(sender_psid) {
  console.log("🚀 Trigger Loại Túi Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ về túi ngực bác chỉ đặt túi Mentor chị nha, túi được FDA chứng nhận và có trên 40 năm. Các dòng túi khác chưa vượt qua thời gian nghiên cứu lâm sàn là 10 năm bác Vũ không đặt ạ. Bác chuyên bệnh lý lành tính và ung thư vú nên chỉ chọn những sản phẩm an toàn chị nhé.`
  });
}

async function sendTuiMentorExtraFlow(sender_psid) {
  console.log("🚀 Trigger Túi Mentor Extra Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Mentor Extra là dòng túi mới của Mentor có chất gel đầy và căng hơn phù hợp với chị nào có ngực sa trễ hoặc đã có bầu ngực dưới và chị nào thích ngực sexy.

Túi Mentor classic thì hợp các chị ngực nhỏ, thích nâng form tự nhiên ạ`
  });
}

module.exports = {
  sendLoaiTuiFlow,
  sendTuiMentorExtraFlow
};
