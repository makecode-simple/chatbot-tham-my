const natural = require('natural');
const classifier = new natural.BayesClassifier();
const serviceFlows = require('./servicesFlow');

classifier.load('model.json', async (err, classifier) => {
  if (err) {
    console.error('Error loading model:', err);
    return;
  }

  async function handleMessage(sender_psid, received_message) {
    console.log("📥 Received message:", received_message);
    
    const messageText = received_message.text;
    if (!messageText) return;

    const intent = classifier.classify(messageText.toLowerCase());
    console.log("🎯 Detected intent:", intent);

    switch (intent) {
      case 'nang_nguc':
        await serviceFlows.sendNangNgucFlow(sender_psid);
        break;
      case 'nang_mui':
        await serviceFlows.sendNangMuiFlow(sender_psid);
        break;
      case 'tham_my_mat':
        await serviceFlows.sendThamMyMatFlow(sender_psid);
        break;
      case 'tham_my_cam':
        await serviceFlows.sendThamMyCamFlow(sender_psid);
        break;
      case 'hut_mo':
        await serviceFlows.sendHutMoBungFlow(sender_psid);
        break;
      case 'cang_da':
        await serviceFlows.sendCangDaMatFlow(sender_psid);
        break;
      case 'tham_my_vung_kin':
        await serviceFlows.sendThamMyVungKinFlow(sender_psid);
        break;
      case 'dat_lich':
        await serviceFlows.sendBookingFlow(sender_psid);
        break;
      case 'dia_chi':
        await serviceFlows.sendDiaChiFlow(sender_psid);
        break;
      case 'hoi_gia':
        await serviceFlows.sendMenuBangGia(sender_psid);
        break;
      case 'xem_feedback':
        await serviceFlows.sendFeedbackFlow(sender_psid);
        break;
      case 'menu_dich_vu':
      default:
        await serviceFlows.sendMenuDichVu(sender_psid);
        break;
    }
  }

  module.exports = handleMessage;
});