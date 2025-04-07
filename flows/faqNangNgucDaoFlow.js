const messengerClient = require('../services/messengerClient');

async function sendFaqNangNgucDaoFlow(sender_psid) {
  console.log("🚀 Trigger FAQ Nâng Ngực Dao Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ chào chị, em xin phép chia sẻ về phương pháp NÂNG NGỰC KHÔNG ĐAU bằng dao mổ siêu âm Ultrasonic Surgical Scalpel:

* Bác sĩ Vũ là bác sĩ đầu tiên và duy nhất hiện nay ứng dụng dao mổ siêu âm trong phẫu thuật nâng ngực.

* Ưu điểm của phương pháp:
- Không đau sau mổ
- Không chảy máu 
- Không tiết dịch
- Không co thắt bao xơ
- Không cần nghỉ dưỡng dài ngày

* Sau 12-18h phẫu thuật:
- Có thể sinh hoạt bình thường
- Đi làm bình thường
- Không cần nghỉ dưỡng

* KHÔNG ĐẶT ỐNG DẪN LƯU
* KHÔNG DÙNG THÊM THUỐC GIẢM ĐAU HAY KHÁNG SINH`
  });

  await messengerClient.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

module.exports = sendFaqNangNgucDaoFlow;