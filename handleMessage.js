const natural = require('natural');
const fs = require('fs');
const serviceFlows = require('./servicesFlow');
const messengerClient = require('./services/messengerClient');

// Load classifier and country rules
const modelData = JSON.parse(fs.readFileSync('model.json', 'utf8'));
const classifier = natural.BayesClassifier.restore(modelData);
const countryDigitRules = JSON.parse(fs.readFileSync('./data/countryDigitRules.json', 'utf8'));

function isValidPhoneNumber(message) {
  if (!message) return false;
  let cleanNumber = message.replace(/\D/g, '');
  
  // Convert local VN format to international
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '84' + cleanNumber.slice(1);
  }
  
  // Add + if not present
  if (!cleanNumber.startsWith('+')) {
    cleanNumber = '+' + cleanNumber;
  }

  // Find matching country code
  const countryCode = Object.keys(countryDigitRules).find(code => 
    cleanNumber.startsWith(code)
  );

  if (!countryCode) return false;

  // Validate number length based on country rules
  const numberWithoutCode = cleanNumber.slice(countryCode.length);
  const rule = countryDigitRules[countryCode];
  const length = numberWithoutCode.length;
  
  return length >= rule.min && length <= rule.max;
}

async function handleMessage(sender_psid, received_message) {
  console.log("📥 Received message:", received_message);
  
  const messageText = received_message.text;
  if (!messageText) return;

  // Check if message contains valid phone number
  if (isValidPhoneNumber(messageText)) {
    await messengerClient.sendMessage(sender_psid, {
      text: "Dạ em cảm ơn chị đã để lại thông tin. Ngân trợ lý sẽ liên hệ tư vấn chi tiết cho chị trong thời gian sớm nhất ạ!"
    });
    return;
  }

  // Normal intent classification flow
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