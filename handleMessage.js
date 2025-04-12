const natural = require('natural');
const fs = require('fs');
const serviceFlows = require('./servicesFlow');
const messengerClient = require('./services/messengerClient');
const { completedUsers, userResponses } = require('./index.js');

// Load classifier and country rules
const modelData = JSON.parse(fs.readFileSync('model.json', 'utf8'));
const classifier = natural.BayesClassifier.restore(modelData);
const countryDigitRules = JSON.parse(fs.readFileSync('./data/countryDigitRules.json', 'utf8'));

function isValidPhoneNumber(message) {
  if (!message) return false;
  let cleanNumber = message.replace(/\D/g, '');
  
  // Special handling for Vietnamese numbers
  if (cleanNumber.startsWith('0') && cleanNumber.length === 10) {
    return true; // Valid VN number format: 0xxxxxxxxx
  }
  
  // Handle international format
  if (cleanNumber.startsWith('84') && cleanNumber.length === 11) {
    return true; // Valid VN international format: 84xxxxxxxxx
  }
  
  if (cleanNumber.startsWith('+84') && cleanNumber.length === 12) {
    return true; // Valid VN international format: +84xxxxxxxxx
  }

  // For other international numbers, use countryDigitRules
  if (!cleanNumber.startsWith('+')) {
    cleanNumber = '+' + cleanNumber;
  }

  const countryCode = Object.keys(countryDigitRules).find(code => 
    cleanNumber.startsWith(code) && code !== '+84' // Skip VN as we handled it above
  );

  if (!countryCode) return false;

  const numberWithoutCode = cleanNumber.slice(countryCode.length);
  const rule = countryDigitRules[countryCode];
  const length = numberWithoutCode.length;
  
  return length >= rule.min && length <= rule.max;
}

// Replace userResponses Map with simple object
const userResponseCounts = {};

async function handleMessage(sender_psid, received_message) {
  try {
    console.log("📥 Received message:", received_message);
    
    // Show typing indicator
    await messengerClient.sendTypingIndicator(sender_psid);
    
    const messageText = received_message.text;
    if (!messageText) {
      await serviceFlows.sendMenuDichVu(sender_psid);
      return;
    }

    // Check for session completion phrases
    const completionPhrases = ['ok em', 'ok', 'cam on em', 'cảm ơn em', 'thank you', 'thanks'];
    if (completionPhrases.some(phrase => messageText.toLowerCase().includes(phrase))) {
      const responseCount = userResponseCounts[sender_psid] || 0;
      userResponseCounts[sender_psid] = responseCount + 1;
      
      if (responseCount === 0) {
        await messengerClient.sendMessage(sender_psid, {
          text: "Dạ em cảm ơn chị đã quan tâm ạ!"
        });
      } else if (responseCount === 1) {
        await messengerClient.sendMessage(sender_psid, {
          text: "Dạ chị!"
        });
      }
      return;
    }

    // Update reset counter section
    if (!completionPhrases.some(phrase => messageText.toLowerCase().includes(phrase))) {
      delete userResponseCounts[sender_psid];
    }

    // Check for phone number pattern but might be invalid
    const phonePattern = /(?:\d[\s-]*){9,}/;
    if (phonePattern.test(messageText.replace(/\D/g, ''))) {
      if (isValidPhoneNumber(messageText)) {
        await messengerClient.sendMessage(sender_psid, {
          text: "Dạ em cảm ơn chị đã để lại thông tin. Ngân trợ lý sẽ liên hệ tư vấn chi tiết cho chị trong thời gian sớm nhất ạ!"
        });
        
        // Add delay before sending warning
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Send warning about fake products
        await messengerClient.sendMessage(sender_psid, {
          text: `https://www.facebook.com/106197712068075/posts/352369154209319

Hiện nay tình trạng giả Ultrasonic Surgical Scalpel rất nhiều, chị tham khảo thêm bài viết để lấy kinh nghiệm cho bản thân nhé ạ!`
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
      .replace(/[!.,?]/g, "")
      .trim();
    
    const intent = classifier.classify(normalizedText);
    console.log("🎯 Detected intent:", intent);

    // Map intent to flow
    try {
      switch (intent) {
        case 'dat_lich':
          await serviceFlows.sendBookingFlow(sender_psid);
          break;
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
        case 'cang_da':
          await serviceFlows.sendCangDaMatFlow(sender_psid);
          break;
        case 'hut_mo':
          await serviceFlows.sendHutMoBungFlow(sender_psid);
          break;
        case 'tham_my_vung_kin':
          await serviceFlows.sendThamMyVungKinFlow(sender_psid);
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
        case 'bien_chung':
          await serviceFlows.sendBienChungFlow(sender_psid);
          break;
        case 'treo_sa_tre':
          await serviceFlows.sendTreoSaTreFlow(sender_psid);
          break;
        case 'faq_thao_tui':
          await serviceFlows.sendThaoTuiFaq(sender_psid);
          break;
        case 'faq_nang_nguc_dao':
          await serviceFlows.sendNangNgucDaoFaq(sender_psid);
          break;
        case 'faq_nguc_bay':
          await serviceFlows.sendFaqNgucBayFlow(sender_psid);
          break;
        // Add missing handlers
        case 'faq_size_tui':
          await serviceFlows.sendFaqSizeTuiFlow(sender_psid);
          break;

        case 'thao_tui_nguc':
          await serviceFlows.sendThaoTuiNgucFlow(sender_psid);
          break;

        case 'treo_cung_may':
          await serviceFlows.sendTreoCungMayFlow(sender_psid);
          break;

        case 'tai_tao_vu':
          await serviceFlows.sendTaiTaoVuFlow(sender_psid);
          break;

        case 'tao_hinh_thanh_bung':
          await serviceFlows.sendTaoHinhThanhBungFlow(sender_psid);
          break;

        case 'chinh_mat_loi':
          await serviceFlows.sendChinhMatLoiFlow(sender_psid);
          break;

        case 'chinh_mui_loi':
          await serviceFlows.sendChinhMuiLoiFlow(sender_psid);
          break;

        case 'hut_mo_body':
          await serviceFlows.sendHutMoBodyFlow(sender_psid);
          break;

        case 'cang_chi_da_mat':
          await serviceFlows.sendCangChiDaMatFlow(sender_psid);
          break;

        case 'don_thai_duong':
          await serviceFlows.sendDonThaiDuongFlow(sender_psid);
          break;

        case 'hut_mo_tiem_len_mat':
          await serviceFlows.sendHutMoTiemLenMatFlow(sender_psid);
          break;

        default:
          await serviceFlows.sendMenuDichVu(sender_psid);
      }

      // Mark message as seen after handling
      await messengerClient.markSeen(sender_psid);

    } catch (error) {
      console.error('Error in intent handling:', error);
      await serviceFlows.sendMenuDichVu(sender_psid);
    }
  } catch (error) {
    console.error('Error in message handling:', error);
    try {
      await messengerClient.sendMessage(sender_psid, {
        text: "Dạ em xin lỗi, hiện tại hệ thống đang bận. Chị vui lòng thử lại sau ạ!"
      });
    } catch (sendError) {
      console.error('Error sending error message:', sendError);
    }
  }
}

module.exports = handleMessage;