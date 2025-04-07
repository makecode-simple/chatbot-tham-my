const natural = require('natural');
const fs = require('fs');
const serviceFlows = require('./servicesFlow');

// Create and restore classifier
const modelData = JSON.parse(fs.readFileSync('model.json', 'utf8'));
const classifier = natural.BayesClassifier.restore(modelData);

async function handleMessage(sender_psid, received_message) {
  console.log("📥 Received message:", received_message);
  
  const messageText = received_message.text;
  if (!messageText) return;

  // Normalize and classify intent
  const normalizedText = messageText.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[!.,?]/g, "");
    
  const intent = classifier.classify(normalizedText);
  console.log("🎯 Detected intent:", intent);

  // Map intent to flow
  try {
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
      default:
        await serviceFlows.sendMenuDichVu(sender_psid);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await serviceFlows.sendMenuDichVu(sender_psid);
  }
}

module.exports = handleMessage;