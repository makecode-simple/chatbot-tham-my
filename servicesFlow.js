const messengerService = require('./messengerService');
const { getFeedbackImages, getBangGiaImage } = require('./cloudinaryService');

// Default flow handler if specific flow not implemented
async function defaultServiceFlow(sender_psid, serviceName) {
  console.log(`🚀 Trigger ${serviceName} Flow`);
  
  await messengerService.sendMessage(sender_psid, {
    text: `Dạ với hơn 10 năm kinh nghiệm, thẩm mỹ hơn 5000 ca mắt - mũi - ngực, chị yên tâm Bác sẽ đưa ra giải pháp tốt nhất phù hợp với cơ địa và mong muốn của chị.`
  });

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

// Export all functions with fallback to default handler
module.exports = {
  sendNangNgucFlow: require('./flows/nangNgucFlow'),
  sendThaoTuiNgucFlow: require('./flows/thaoTuiNgucFlow'),
  sendNangMuiFlow: (sender_psid) => defaultServiceFlow(sender_psid, "Nâng Mũi"),
  sendThamMyMatFlow: (sender_psid) => defaultServiceFlow(sender_psid, "Thẩm Mỹ Mắt"),
  sendHutMoBungFlow: (sender_psid) => defaultServiceFlow(sender_psid, "Hút Mỡ Bụng"),
  sendThamMyVungKinFlow: (sender_psid) => defaultServiceFlow(sender_psid, "Thẩm Mỹ Vùng Kín"),
  sendCangDaMatFlow: (sender_psid) => defaultServiceFlow(sender_psid, "Căng Da Mặt"),
  sendThamMyCamFlow: (sender_psid) => defaultServiceFlow(sender_psid, "Thẩm Mỹ Cằm"),
  sendTreoCungMayFlow: (sender_psid) => defaultServiceFlow(sender_psid, "Treo Cung Mày"),
  sendTaiTaoVuFlow: (sender_psid) => defaultServiceFlow(sender_psid, "Tái Tạo Vú"),
  sendTaoHinhThanhBungFlow: (sender_psid) => defaultServiceFlow(sender_psid, "Tạo Hình Thành Bụng"),
  sendChinhMatLoiFlow: (sender_psid) => defaultServiceFlow(sender_psid, "Chỉnh Mắt Lỗi"),
  sendChinhMuiLoiFlow: (sender_psid) => defaultServiceFlow(sender_psid, "Chỉnh Mũi Lỗi"),
  sendHutMoBodyFlow: (sender_psid) => defaultServiceFlow(sender_psid, "Hút Mỡ Body"),
  sendCangChiDaMatFlow: (sender_psid) => defaultServiceFlow(sender_psid, "Căng Chỉ Da Mặt"),
  sendDonThaiDuongFlow: (sender_psid) => defaultServiceFlow(sender_psid, "Độn Thái Dương"),
  sendHutMoTiemLenMatFlow: (sender_psid) => defaultServiceFlow(sender_psid, "Hút Mỡ Tiêm Lên Mặt"),
  sendDiaChiFlow: async (sender_psid) => {
    await messengerService.sendMessage(sender_psid, {
      text: `Dạ chị, địa chỉ phòng khám của bác Vũ ạ:\n\n🏥 Phòng khám Thẩm mỹ Bác sĩ Hồ Cao Vũ\n📍 Số 12 Đường số 12, P.Bình An, TP.Thủ Đức (Q2 cũ)\n☎️ Hotline: 0909.444.222`
    });
  },
  sendMenuDichVu,
  sendBangGiaOnlyFlow,
  sendMenuBangGia
};