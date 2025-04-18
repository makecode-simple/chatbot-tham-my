const messengerClient = require('../services/messengerClient');

async function sendBocBaoXoFlow(sender_psid) {
  console.log("🚀 Trigger Bóc Bao Xơ Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ chào chị, xin phép chị cho em giới thiệu về phương pháp phẫu thuật BÓC BAO XƠ KHÔNG ĐAU bằng dao mổ siêu âm Ultrasonic Surgical Scalpel chị xem qua ạ.

* Bác sĩ Vũ là bác sĩ đầu tiên và duy nhất hiện nay ứng dụng dao mổ siêu âm Ultrasonic Surgical Scalpel trong phẫu thuật nâng ngực và tạo hình thành bụng dành cho phụ nữ sau sinh.

* Dao Ultrasonic Surgical Scalpel là dao siêu âm. Có ưu điểm ĐỐT - HÀN - CẮT vì thế bác sĩ tạo khoang ngực đặt túi không chảy máu, không chảy dịch, giảm đau sau phẫu thuật đến 90%, lành thương nhanh, không gây ra các biến chứng và biến chứng muộn.
* Thời gian nghỉ dưỡng rất ít, chỉ sau 12-18h phẫu thuật chị có thể sinh hoạt, đi làm bình thường, không cần nghỉ dưỡng.
* Sau phẫu thuật KHÔNG ĐẶT ỐNG DẪN LƯU, KHÔNG DÙNG THÊM THUỐC GIẢM ĐAU HAY KHÁNG SINH.

* Phương pháp sử dụng dao Ultrasonic Surgical Scalpel đạt được 5 tiêu chí
1. Không đau
2. Không gây chảy máu
3. Không tiết dịch
4. Không gây co thắt bao xơ
5. Không cần nghỉ dưỡng`
  });

  await messengerClient.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

module.exports = {
  sendBocBaoXoFlow
};
