const messengerClient = require('../services/messengerClient');

async function sendDauNghiFaq(sender_psid) {
  await messengerClient.sendMessage(sender_psid, {
    text: `Không đau ạ. Bác Vũ sử dụng dao siêu âm thế hệ mới nên:
- Không đau, không chảy máu
- Xuất viện và trở lại cuộc sống bình thường ngay sau 6-10 tiếng
- Không cần uống thuốc giảm đau hay kháng sinh
- Không cần nghỉ dưỡng, có thể đi làm bình thường ngay ngày hôm sau
- Sau 2 ngày có thể bay nội địa, 7 ngày bay quốc tế`
  });
}

async function sendThaoTuiFaq(sender_psid) {
  await messengerClient.sendMessage(sender_psid, {
    text: "Bác Vũ tháo túi không đau, không cần nghĩ dưỡng ạ."
  });
}

async function sendNangNgucDaoFaq(sender_psid) {
  await messengerClient.sendMessage(sender_psid, {
    text: `Nâng Ngực Không Đau Với Dao Siêu Âm Thế Hệ Mới - Không Cần Uống Giảm Đau, Kháng Sinh Sau Xuất Viện, Phục Hồi Sau 12H - Hỗ Trợ Quay 100% Ca Mổ - Sử Dụng Dao Siêu Âm Mới 100%
Nâng ngực với dao siêu âm thế hệ mới Ultrasonic Surgical Scalpel do Thạc sĩ - Bác sĩ Hồ Cao Vũ trực tiếp thực hiện:
- Không đau, không chảy máu
- Xuất viện và trở lại cuộc sống bình thường ngay sau 6 tiếng
- Không cần hệ thống dẫn dịch trong và sau phẫu thuật
- Không cần sử dụng giảm đau, kháng sinh sau khi xuất viện
- Sau phẫu thuật 2 ngày bay nội địa, 7 ngày bay quốc tế
- Không co thắt bao xơ
- Không để lại sẹo xấu`
  });
}

async function sendNgucBayFaq(sender_psid) {
  await messengerClient.sendMessage(sender_psid, {
    text: `Sau phẫu thuật nâng ngực chị nằm viện tối đa 12 tiếng, tuy nhiên thông thường thì 6-10 tiếng là khách bác Vũ đã khoẻ đi lại nhẹ nhàng bình thường nên có thể xuất viện sớm hơn.

Sau phẫu thuật không cần uống thêm giảm đau, kháng sinh, không cần đặt ống dẫn lưu, không cần nghỉ dưỡng ạ.

Bên bác Vũ cũng hỗ trợ quay video full 100% ca mổ, sử dụng dao siêu âm mới 100%, khách hàng trực tiếp ký tên lên hộp dao trước khi mổ.

Sau 2 ngày chị có thể bay nội địa, 7 ngày bay quốc tế ạ`
  });
}

module.exports = {
  sendDauNghiFaq,
  sendThaoTuiFaq,
  sendNangNgucDaoFaq,
  sendNgucBayFaq
};