const natural = require('natural');
const fs = require('fs');
const serviceFlows = require('./servicesFlow');
const messengerClient = require('./services/messengerClient');

// Import all flows
const tuiNgucFlow = require('./flows/tuiNgucFlow');
const ngucFaqFlow = require('./flows/ngucFaqFlow');
const hoiGiaFlow = require('./flows/hoiGiaFlow');
const contactFlow = require('./flows/contactFlow');
const xemAnhFlow = require('./flows/xemAnhFlow');
const thamMyMatFlow = require('./flows/thamMyMatFlow');
const chinhMatLoiFlow = require('./flows/chinhMatLoiFlow');
const chinhMuiLoiFlow = require('./flows/chinhMuiLoiFlow');
const donThaiDuongFlow = require('./flows/donThaiDuongFlow');
const hutMoTiemLenMatFlow = require('./flows/hutMoTiemLenMatFlow');
const taoHinhThanhBungFlow = require('./flows/taoHinhThanhBungFlow');
const treoSaTreFlow = require('./flows/treoSaTreFlow');
const treoCungMayFlow = require('./flows/treoCungMayFlow');
const faqNangNgucDaoFlow = require('./flows/faqNangNgucDaoFlow');
const faqNgucBayFlow = require('./flows/faqNgucBayFlow');
const faqSizeTuiFlow = require('./flows/faqSizeTuiFlow');
const faqThaoTuiFlow = require('./flows/faqThaoTuiFlow');
const hutMoBodyFlow = require('./flows/hutMoBodyFlow');
const taiTaoVuFlow = require('./flows/taiTaoVuFlow');
const thaoTuiNgucFlow = require('./flows/thaoTuiNgucFlow');

const { completedUsers, userResponses } = require('./index.js');

// Load classifier and country rules
const modelData = JSON.parse(fs.readFileSync('model.json', 'utf8'));
const classifier = natural.BayesClassifier.restore(modelData);
const countryDigitRules = JSON.parse(fs.readFileSync('./data/countryDigitRules.json', 'utf8'));

// Track user states and responses
const userStates = new Map();
const userResponseCounts = {};

// Helper function to validate phone numbers
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

// Helper function to handle phone number messages
async function handlePhoneNumber(sender_psid, messageText) {
  if (isValidPhoneNumber(messageText)) {
    await messengerClient.sendMessage(sender_psid, {
      text: "Dạ em cảm ơn chị đã để lại thông tin. Ngân trợ lý sẽ liên hệ tư vấn chi tiết cho chị trong thời gian sớm nhất ạ!"
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await messengerClient.sendMessage(sender_psid, {
      text: `https://www.facebook.com/106197712068075/posts/352369154209319

Hiện nay tình trạng giả Ultrasonic Surgical Scalpel rất nhiều, chị tham khảo thêm bài viết để lấy kinh nghiệm cho bản thân nhé ạ!`
    });
    return true;
  } else {
    await messengerClient.sendMessage(sender_psid, {
      text: "Dạ số điện thoại chị cung cấp chưa chính xác. Chị vui lòng kiểm tra và gửi lại giúp em ạ!"
    });
    return true;
  }
}

// Main message handler
async function handleMessage(sender_psid, received_message) {
  try {
    console.log("📥 Received message:", received_message);
    
    const messageText = received_message.text;
    if (!messageText) return;

    // Get current user state
    const currentState = userStates.get(sender_psid) || { 
      lastIntent: null,
      lastMessageTime: 0,
      messageCount: 0
    };

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

    // Reset counter if not a completion phrase
    if (!completionPhrases.some(phrase => messageText.toLowerCase().includes(phrase))) {
      delete userResponseCounts[sender_psid];
    }

    // Check for phone number first
    const phonePattern = /(?:\d[\s-]*){9,}/;
    if (phonePattern.test(messageText.replace(/\D/g, ''))) {
      return await handlePhoneNumber(sender_psid, messageText);
    }

    // Get intent classification
    const classifications = classifier.getClassifications(messageText);
    const topIntent = classifications[0];
    console.log("🎯 Detected intent:", topIntent.label);

    // Prevent rapid repeated messages
    const now = Date.now();
    const timeSinceLastMessage = now - currentState.lastMessageTime;
    const isSameIntent = currentState.lastIntent === topIntent.label;

    if (isSameIntent && timeSinceLastMessage < 5000) {
      currentState.messageCount++;
      if (currentState.messageCount > 3) {
        await messengerClient.sendMessage(sender_psid, {
          text: "Dạ em đã nhận được tin nhắn của chị. Em sẽ hỗ trợ chị ngay ạ!"
        });
        userStates.set(sender_psid, {
          ...currentState,
          lastMessageTime: now
        });
        return;
      }
    } else {
      currentState.messageCount = 1;
    }

    // Update user state
    userStates.set(sender_psid, {
      lastIntent: topIntent.label,
      lastMessageTime: now,
      messageCount: currentState.messageCount
    });

    // Handle intents
    switch (topIntent.label) {
      case 'tham_my_mat':
        await thamMyMatFlow(sender_psid);
        break;
      case 'dat_lich':
        await serviceFlows.sendBookingFlow(sender_psid);
        break;
      case 'nang_nguc':
        await serviceFlows.sendNangNgucFlow(sender_psid);
        break;
      case 'nang_mui':
        await serviceFlows.sendNangMuiFlow(sender_psid);
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
      case 'bao_hanh':
        await serviceFlows.sendBaoHanhFlow(sender_psid);
        break;
      case 'quy_trinh':
        await serviceFlows.sendQuyTrinhFlow(sender_psid);
        break;
      case 'chinh_mat_loi':
        await chinhMatLoiFlow(sender_psid);
        break;
      case 'chinh_mui_loi':
        await chinhMuiLoiFlow(sender_psid);
        break;
      case 'don_thai_duong':
        await donThaiDuongFlow(sender_psid);
        break;
      case 'hut_mo_tiem_len_mat':
        await hutMoTiemLenMatFlow(sender_psid);
        break;
      case 'tao_hinh_thanh_bung':
        await taoHinhThanhBungFlow(sender_psid);
        break;
      case 'treo_sa_tre':
        await treoSaTreFlow(sender_psid);
        break;
      case 'treo_cung_may':
        await treoCungMayFlow(sender_psid);
        break;
      case 'faq_nang_nguc_dao':
        await faqNangNgucDaoFlow(sender_psid);
        break;
      case 'faq_nguc_bay':
        await faqNgucBayFlow(sender_psid);
        break;
      case 'faq_size_tui':
        await faqSizeTuiFlow(sender_psid);
        break;
      case 'faq_thao_tui':
        await faqThaoTuiFlow(sender_psid);
        break;
      case 'hut_mo_body':
        await hutMoBodyFlow(sender_psid);
        break;
      case 'tai_tao_vu':
        await taiTaoVuFlow(sender_psid);
        break;
      case 'thao_tui_nguc':
        await thaoTuiNgucFlow(sender_psid);
        break;
      default:
        await messengerClient.sendMessage(sender_psid, {
          text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
        });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await messengerClient.sendMessage(sender_psid, {
      text: "Dạ xin lỗi chị, hiện tại hệ thống đang gặp sự cố. Chị vui lòng thử lại sau ít phút nha!"
    });
  }
}

module.exports = handleMessage;

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
  // Get current user state
  const currentState = userStates.get(sender_psid) || { 
    lastIntent: null,
    lastMessageTime: 0,
    messageCount: 0
  };

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

  // Get intent classification
  const classifications = classifier.getClassifications(messageText);
  const topIntent = classifications[0];
  console.log("🎯 Detected intent:", topIntent.label);

  // Prevent rapid repeated messages with same intent
  const now = Date.now();
  const timeSinceLastMessage = now - currentState.lastMessageTime;
  const isSameIntent = currentState.lastIntent === topIntent.label;

  if (isSameIntent && timeSinceLastMessage < 5000) {
    currentState.messageCount++;
    if (currentState.messageCount > 3) {
      await messengerClient.sendMessage(sender_psid, {
        text: "Dạ em đã nhận được tin nhắn của chị. Em sẽ hỗ trợ chị ngay ạ!"
      });
      userStates.set(sender_psid, {
        ...currentState,
        lastMessageTime: now
      });
      return;
    }
  } else {
    currentState.messageCount = 1;
  }

  // Update user state
  userStates.set(sender_psid, {
    lastIntent: topIntent.label,
    lastMessageTime: now,
    messageCount: currentState.messageCount
  });

  // Check for phone number pattern first
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
      return;
    } else {
      await messengerClient.sendMessage(sender_psid, {
        text: "Dạ số điện thoại chị cung cấp chưa chính xác. Chị vui lòng kiểm tra và gửi lại giúp em ạ!"
      });
      return;
    }
  }

  // Handle intents
  try {
    switch (topIntent.label) {
      case 'tham_my_mat':
        await thamMyMatFlow(sender_psid);
        break;
      case 'dat_lich':
        await serviceFlows.sendBookingFlow(sender_psid);
        break;
      case 'nang_nguc':
        await serviceFlows.sendNangNgucFlow(sender_psid);
        break;
      case 'nang_mui':
        await serviceFlows.sendNangMuiFlow(sender_psid);
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
      default:
        // If no specific intent is matched, ask for phone number
        await messengerClient.sendMessage(sender_psid, {
          text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
        });
    }
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
      case 'faq_size_tui':
        await serviceFlows.sendFaqSizeTuiFlow(sender_psid);
        break;
      case 'faq_dau_nghi':
      case 'hoi_dau':
        await ngucFaqFlow.sendDauNghiFaq(sender_psid);
        break;
      case 'faq_loai_tui':
        await tuiNgucFlow.sendLoaiTuiFlow(sender_psid);
        break;
      case 'faq_tui_mentor_extra':
        await tuiNgucFlow.sendTuiMentorExtraFlow(sender_psid);
        break;
      case 'gia_mat':
        await hoiGiaFlow.sendGiaMatFlow(sender_psid);
        break;
      case 'gia_tham_my_cam':
        await hoiGiaFlow.sendGiaCamFlow(sender_psid);
        break;
      case 'xem_bang_gia_full':
        await hoiGiaFlow.sendHoiGiaFlow(sender_psid);
        break;
      case 'xem_bang_gia_nguc':
        await hoiGiaFlow.sendGiaNgucFlow(sender_psid);
        break;
      case 'xem_bang_gia_mat':
        await hoiGiaFlow.sendGiaMatFlow(sender_psid);
        break;
      case 'xem_bang_gia_mui':
        await hoiGiaFlow.sendGiaMuiFlow(sender_psid);
        break;
      case 'xem_bang_gia_cam':
        await hoiGiaFlow.sendGiaCamFlow(sender_psid);
        break;
      case 'xem_bang_gia_mong':
        await hoiGiaFlow.sendGiaMongFlow(sender_psid);
        break;
      case 'xem_anh_nguc':
        await xemAnhFlow.sendAnhNgucFlow(sender_psid);
        break;
      case 'xem_anh_mat':
        await xemAnhFlow.sendAnhMatFlow(sender_psid);
        break;
      case 'xem_anh_mui':
        await xemAnhFlow.sendAnhMuiFlow(sender_psid);
        break;
      case 'xem_anh_mong':
        await xemAnhFlow.sendAnhMongFlow(sender_psid);
        break;
      case 'xem_anh_vungkin':
        await xemAnhFlow.sendAnhVungKinFlow(sender_psid);
        break;
      case 'xem_anh_hutmo':
        await xemAnhFlow.sendAnhHutMoFlow(sender_psid);
        break;
      case 'xem_anh_vu':
        await xemAnhFlow.sendAnhVuFlow(sender_psid);
        break;
      case 'xem_anh_da':
        await xemAnhFlow.sendAnhDaFlow(sender_psid);
        break;
      case 'xem_anh_satre':
        await xemAnhFlow.sendAnhSaTreFlow(sender_psid);
        break;
      case 'khong_co_sdt':
        await contactFlow.sendNoPhoneResponse(sender_psid);
        break;
      default:
        await serviceFlows.sendMenuDichVu(sender_psid);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await messengerClient.sendMessage(sender_psid, {
      text: "Dạ xin lỗi chị, hiện tại hệ thống đang gặp sự cố. Chị vui lòng thử lại sau ít phút nha!"
    });
  }
}

module.exports = handleMessage;

      }
    }
  }
}

  } catch (error) {
    console.error('Error handling message:', error);
    await messengerClient.sendMessage(sender_psid, {
      text: "Dạ xin lỗi chị, hiện tại hệ thống đang gặp sự cố. Chị vui lòng thử lại sau ít phút nha!"
    });
  }
}

module.exports = handleMessage;