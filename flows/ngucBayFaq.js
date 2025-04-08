const messengerClient = require('../services/messengerClient');

async function sendFaqNgucBayFlow(sender_psid) {
  console.log("🚀 Trigger FAQ Ngực Bay Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ chào chị, em xin phép chia sẻ thông tin về thời gian hồi phục và đi máy bay sau phẫu thuật nâng ngực ạ:

* Thời gian nằm viện và hồi phục:
- Nằm viện tối đa 12 tiếng
- Thông thường 6-10 tiếng là có thể đi lại nhẹ nhàng và xuất viện
- Không cần uống thêm giảm đau, kháng sinh
- Không cần đặt ống dẫn lưu
- Không cần nghỉ dưỡng

* Thời gian an toàn để đi máy bay:
- Sau 2 ngày có thể bay nội địa
- Sau 7 ngày có thể bay quốc tế

* Cam kết chất lượng:
- Quay video full 100% ca mổ
- Sử dụng dao siêu âm mới 100%
- Khách hàng trực tiếp ký tên lên hộp dao trước khi mổ`
  });
}

module.exports = sendFaqNgucBayFlow;