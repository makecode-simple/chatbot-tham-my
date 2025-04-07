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
  
  // Handle common formats
  if (cleanNumber.startsWith('0')) { // Vietnam local format
    cleanNumber = '84' + cleanNumber.slice(1);
  } else if (cleanNumber.startsWith('1') && cleanNumber.length === 10) { // US/Canada format
    cleanNumber = '+' + cleanNumber;
  } else if (!cleanNumber.startsWith('+')) {
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
  
  console.log(`📱 Phone validation:
    Original: ${message}
    Cleaned: ${cleanNumber}
    Country: ${countryCode}
    Length: ${length} (required: ${rule.min}-${rule.max})`);
  
  return length >= rule.min && length <= rule.max;
}

async function handleMessage(sender_psid, received_message) {
  console.log("📥 Received message:", received_message);
  
  const messageText = received_message.text;
  if (!messageText) return;

  // Check for phone number pattern but might be invalid
  const phonePattern = /(?:\d[\s-]*){9,}/;
  if (phonePattern.test(messageText.replace(/\D/g, ''))) {
    if (isValidPhoneNumber(messageText)) {
      await messengerClient.sendMessage(sender_psid, {
        text: "Dạ em cảm ơn chị đã để lại thông tin. Ngân trợ lý sẽ liên hệ tư vấn chi tiết cho chị trong thời gian sớm nhất ạ!"
      });
    } else {
      await messengerClient.sendMessage(sender_psid, {
        text: "Dạ số điện thoại chị cung cấp chưa chính xác. Chị vui lòng kiểm tra và gửi lại giúp em ạ!"
      });
    }
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