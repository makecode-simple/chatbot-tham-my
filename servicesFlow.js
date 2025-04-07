const messengerClient = require('./services/messengerClient');
const { getFeedbackImages, getBangGiaImage } = require('./cloudinaryService');

async function sendMenuDichVu(sender_psid) {
  console.log("🚀 Trigger Menu Dịch Vụ");
  await messengerClient.sendMessage(sender_psid, {
    text: "Dạ chị, em gửi chị các dịch vụ của bác Vũ ạ:\n\n1. Nâng Ngực\n2. Nâng Mũi\n3. Thẩm Mỹ Mắt\n4. Thẩm Mỹ Cằm\n5. Hút Mỡ\n6. Căng Da Mặt\n7. Thẩm Mỹ Vùng Kín\n\nChị quan tâm dịch vụ nào ạ?"
  });
}

async function sendBangGiaOnlyFlow(sender_psid, type) {
  console.log("🚀 Trigger Bảng Giá Flow:", type);
  const bangGiaImage = await getBangGiaImage(`banggia_${type}`);
  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }
}

async function sendMenuBangGia(sender_psid) {
  console.log("🚀 Trigger Menu Bảng Giá");
  await sendBangGiaOnlyFlow(sender_psid, "cacdichvu");
}

async function defaultServiceFlow(sender_psid, serviceName) {
  console.log(`🚀 Trigger ${serviceName} Flow`);
  
  await messengerService.sendMessage(sender_psid, {
    text: `Dạ với hơn 10 năm kinh nghiệm, thẩm mỹ hơn 5000 ca mắt - mũi - ngực, chị yên tâm Bác sẽ đưa ra giải pháp tốt nhất phù hợp với cơ địa và mong muốn của chị.`
  });

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

async function sendDiaChiFlow(sender_psid) {
  console.log("🚀 Trigger Địa Chỉ Flow");
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ chị, địa chỉ phòng khám của bác Vũ ạ:\n\n🏥 Phòng khám Thẩm mỹ Bác sĩ Hồ Cao Vũ\n📍 134 Hà Huy Tập, Phú Mỹ Hưng, Quận 7\n\n* Phẫu thuật tại bệnh viện quốc tế Nam Sài Gòn.\n* Hiện tại bác Vũ chỉ nhận khám và tư vấn theo lịch hẹn trước ạ.\n\n☎️ Hotline: 0909.444.222`
  });
}

const serviceFlows = {
  sendNangNgucFlow: require('./flows/nangNgucFlow'),
  sendThaoTuiNgucFlow: require('./flows/thaoTuiNgucFlow'),
  sendNangMuiFlow: require('./flows/nangMuiFlow'),
  sendThamMyMatFlow: require('./flows/thamMyMatFlow'),
  sendHutMoBungFlow: require('./flows/hutMoBungFlow'),
  sendThamMyVungKinFlow: require('./flows/thamMyVungKinFlow'),
  sendCangDaMatFlow: require('./flows/cangDaMatFlow'),
  sendThamMyCamFlow: require('./flows/thamMyCamFlow'),
  sendTreoCungMayFlow: require('./flows/treoCungMayFlow'),
  sendTaiTaoVuFlow: require('./flows/taiTaoVuFlow'),
  sendTaoHinhThanhBungFlow: require('./flows/taoHinhThanhBungFlow'),
  sendChinhMatLoiFlow: require('./flows/chinhMatLoiFlow'),
  sendChinhMuiLoiFlow: require('./flows/chinhMuiLoiFlow'),
  sendHutMoBodyFlow: require('./flows/hutMoBodyFlow'),
  sendCangChiDaMatFlow: require('./flows/cangChiDaMatFlow'),
  sendDonThaiDuongFlow: require('./flows/donThaiDuongFlow'),
  sendHutMoTiemLenMatFlow: require('./flows/hutMoTiemLenMatFlow'),
  sendFeedbackFlow: require('./flows/feedbackFlow'),
  sendDiaChiFlow,
  sendMenuDichVu,
  sendBangGiaOnlyFlow,
  sendMenuBangGia,
  sendBookingFlow: require('./flows/bookingFlow'),
};

module.exports = serviceFlows;