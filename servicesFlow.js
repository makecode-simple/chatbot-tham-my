const messengerClient = require('./services/messengerClient');
const { getFeedbackImages, getBangGiaImage } = require('./cloudinaryService');
const sendBienChungFlow = require('./flows/bienChungFlow');
const sendTreoSaTreFlow = require('./flows/treoSaTreFlow');

async function sendMenuDichVu(sender_psid) {
  console.log("🚀 Trigger Menu Dịch Vụ");
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ chào chị, chị muốn tư vấn dịch vụ thẩm mỹ tạo hình nào dưới đây ạ:

* Phẫu thuật nâng ngực/ tháo túi ngực/ bóc bao xơ
* Tái tạo vú sau khi điều trị ung thư
* Hút mỡ bụng, tạo hình thành bụng sau sinh
* Tiểu phẫu cắt mí
* Tiểu phẫu treo cung mày
* Chỉnh mắt lỗi
* Nâng mũi tái cấu trúc/ nâng mũi sụn sườn
* Chỉnh mũi lỗi
* Phẫu thuật căng da mặt
* Hút mỡ bụng/tay/ đùi/ lưng
* Thẩm mỹ vùng kín
* Căng da mặt toàn diện
* Căng chỉ da mặt/ PRP trẻ hóa
* Độn thái dương/ độn cằm
* Hút mỡ tiêm lên mặt`
  });
}

async function sendBangGiaOnlyFlow(sender_psid, type) {
  console.log("🚀 Trigger Bảng Giá Flow:", type);
  const bangGiaImage = await getBangGiaImage(`banggia_${type}`);
  if (bangGiaImage) {
    await messengerClient.sendMessage(sender_psid, {
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
  
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ với hơn 10 năm kinh nghiệm, thẩm mỹ hơn 5000 ca mắt - mũi - ngực, chị yên tâm Bác sẽ đưa ra giải pháp tốt nhất phù hợp với cơ địa và mong muốn của chị.`
  });

  await messengerClient.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

async function sendDiaChiFlow(sender_psid) {
  console.log("🚀 Trigger Địa Chỉ Flow");
  await messengerClient.sendMessage(sender_psid, {
    text: `Dạ bác Vũ tư vấn tại 134 Hà Huy Tập, Phú Mỹ Hưng, Quận 7

* Phẫu thuật tại bệnh viện quốc tế Nam Sài Gòn.
* Hiện tại bác Vũ chỉ nhận khám và tư vấn theo lịch hẹn trước ạ.`
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
  // Add FAQ flows
  // Change from sendFaqThaoTuiFlow to sendThaoTuiFaq to match the intent handler
  sendThaoTuiFaq: require('./flows/faqThaoTuiFlow'),
  sendFaqNangNgucDaoFlow: require('./flows/faqNangNgucDaoFlow'),
  // Change from sendFaqNgucBayFlow to sendNgucBayFaq to match handleMessage.js
  sendNgucBayFaq: require('./flows/faqNgucBayFlow'),
  sendFaqSizeTuiFlow: require('./flows/faqSizeTuiFlow'),
  
  // Add missing flows
  sendHoiGiaFlow: require('./flows/hoiGiaFlow'),
  
  // Existing flows
  sendBienChungFlow,
  sendDiaChiFlow,
  sendMenuDichVu,
  sendBangGiaOnlyFlow,
  sendMenuBangGia,
  sendBookingFlow: require('./flows/bookingFlow'),
  sendTreoSaTreFlow,
};

module.exports = serviceFlows;