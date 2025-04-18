const messengerClient = require('../services/messengerClient');
const { getFeedbackImages, getBangGiaImage } = require('../cloudinaryService');

async function sendPrpTreHoaFlow(sender_psid) {
  console.log("🚀 Trigger PRP Trẻ Hóa Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ chào chị, xin phép chị cho em giới thiệu về công nghệ PRP - Tiểu Cầu Giàu Plasma chị xem qua ạ.

* PRP (Platelet Rich Plasma) là công nghệ trẻ hóa da bằng huyết tương giàu tiểu cầu từ chính máu của người điều trị. Đây là phương pháp tự nhiên, an toàn và hiệu quả cao.

* Ưu điểm của công nghệ PRP:
1. Tự nhiên, sử dụng huyết tương từ chính cơ thể
2. An toàn tuyệt đối, không có phản ứng phụ
3. Hiệu quả nhanh chóng và lâu dài
4. Kích thích tái tạo collagen tự nhiên
5. Cải thiện kết cấu và độ đàn hồi của da
6. Làm mờ nếp nhăn và vết thâm

* Hiệu quả điều trị:
- Trẻ hóa da, làm căng mịn
- Cải thiện sẹo rỗ, mụn
- Thu nhỏ lỗ chân lông
- Làm mờ thâm nám
- Tăng độ đàn hồi cho da
- Cải thiện quầng thâm mắt

* Quy trình điều trị:
1. Lấy máu từ tĩnh mạch
2. Ly tâm tách chiết PRP
3. Tiêm PRP vào vùng điều trị
4. Chăm sóc và theo dõi sau điều trị

* Kết quả có thể thấy được sau 2-3 tuần và duy trì 12-18 tháng.`
  });

  await messengerClient.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

module.exports = {
  sendPrpTreHoaFlow
};
