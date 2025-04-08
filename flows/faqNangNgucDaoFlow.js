const messengerClient = require('../services/messengerClient');

async function sendFaqNangNgucDaoFlow(sender_psid) {
  console.log("🚀 Trigger FAQ Nâng Ngực Dao Siêu Âm Flow");
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Nâng Ngực Không Đau Với Dao Siêu Âm Thế Hệ Mới - Không Cần Uống Giảm Đau, Kháng Sinh Sau Xuất Viện, Phục Hồi Sau 12H - Hỗ Trợ Quay 100% Ca Mổ - Sử Dụng Dao Siêu Âm Mới 100%

Nâng ngực với dao siêu âm thế hệ mới Ultrasonic Surgical Scalpel do Thạc sĩ - Bác sĩ Hồ Cao Vũ trực tiếp thực hiện:
• Không đau, không chảy máu
• Xuất viện và trở lại cuộc sống bình thường ngay sau 6 tiếng
• Không cần hệ thống dẫn dịch trong và sau phẫu thuật
• Không cần sử dụng giảm đau, kháng sinh sau khi xuất viện
• Sau phẫu thuật 2 ngày bay nội địa, 7 ngày bay quốc tế
• Không co thắt bao xơ
• Không để lại sẹo xấu`
  });
}

module.exports = sendFaqNangNgucDaoFlow;