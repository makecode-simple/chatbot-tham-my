const messengerClient = require('../services/messengerClient');

async function sendFaqThaoTuiFlow(sender_psid) {
  console.log("🚀 Trigger FAQ Tháo Túi Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ chào chị, em xin phép chia sẻ thông tin về PHẪU THUẬT THÁO TÚI NGỰC KHÔNG ĐAU bằng dao mổ siêu âm Ultrasonic Surgical Scalpel ạ:

* Bác sĩ Vũ là bác sĩ đầu tiên và duy nhất hiện nay ứng dụng dao mổ siêu âm trong phẫu thuật tháo túi ngực.

* Dao Ultrasonic Surgical Scalpel có ưu điểm ĐỐT - HÀN - CẮT vì thế:
- Không chảy máu
- Không chảy dịch
- Giảm đau sau phẫu thuật đến 90%
- Lành thương nhanh
- Không gây ra các biến chứng và biến chứng muộn

* Thời gian nghỉ dưỡng rất ít:
- Chỉ sau 12-18h phẫu thuật chị có thể sinh hoạt, đi làm bình thường
- Không cần nghỉ dưỡng dài ngày

* Sau phẫu thuật:
- KHÔNG ĐẶT ỐNG DẪN LƯU
- KHÔNG DÙNG THÊM THUỐC GIẢM ĐAU HAY KHÁNG SINH`
  });

  await messengerClient.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

module.exports = sendFaqThaoTuiFlow;