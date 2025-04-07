const natural = require('natural');
const fs = require('fs');
const serviceFlows = require('./servicesFlow');

// Create classifier and load model synchronously
const classifier = new natural.BayesClassifier();
const modelData = JSON.parse(fs.readFileSync('model.json', 'utf8'));
natural.BayesClassifier.restore(modelData);

async function handleMessage(sender_psid, received_message) {
  console.log("📥 Received message:", received_message);
  
  const messageText = received_message.text;
  if (!messageText) return;

  // Classify intent
  const intent = classifier.classify(messageText.toLowerCase());
  console.log("🎯 Detected intent:", intent);

  // Map intent to flow
  switch (intent) {
    case 'dat_lich':
      await serviceFlows.sendBookingFlow(sender_psid);
      break;
    case 'menu_dich_vu':
      await serviceFlows.sendMenuDichVu(sender_psid);
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
  }
}

module.exports = handleMessage;