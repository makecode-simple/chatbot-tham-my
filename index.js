const express = require("express");
const bodyParser = require("body-parser");
const messengerService = require("./messengerService");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());

// Load flow dịch vụ và country rules
const flowData = JSON.parse(fs.readFileSync("Flow_Full_Services_DrHoCaoVu.json"));
const countryDigitRules = JSON.parse(fs.readFileSync("countryDigitRules.json"));
const countryCodes = Object.keys(countryDigitRules);

// Session state
const completedUsers = new Set();
const handoffUsers = new Set();

// ====== VALIDATE PHONE ======
function isValidPhoneNumber(message) {
  if (!message) return false;
  let cleanNumber = message.replace(/[\s-]/g, '');

  if (cleanNumber.startsWith('0')) {
    cleanNumber = '+84' + cleanNumber.slice(1);
  }

  if (!cleanNumber.startsWith('+')) return false;

  const countryCode = countryCodes.find(code => cleanNumber.startsWith(code));
  if (!countryCode) {
    const genericPhone = /^\+\d{6,15}$/.test(cleanNumber);
    if (genericPhone) {
      console.log(`❗ Số quốc gia chưa có rule: ${cleanNumber}`);
      return "unknown";
    }
    return false;
  }

  const numberWithoutCode = cleanNumber.slice(countryCode.length);
  const digitRule = countryDigitRules[countryCode];
  if (!digitRule) return false;

  const length = numberWithoutCode.length;
  if (length < digitRule.min || length > digitRule.max) {
    console.log(`❌ Số không đúng độ dài quy định cho ${countryCode}: ${length} số`);
    return false;
  }

  console.log(`✅ Số hợp lệ: ${cleanNumber}`);
  return true;
}

// ====== DETECT END CONVERSATION ======
function isEndConversation(message) {
  if (!message) return false;

  const normalizedMsg = message
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[!.,?~]/g, "")
    .trim();

  const endKeywords = [
    "ok", "oke", "okie", "okei", "okey",
    "cam on", "cảm ơn", "thanks", "thank you",
    "duoc roi", "được rồi", "dong y", "dạ rồi", "yes", "vâng", "rồi nha",
    "roi nhe", "oke roi", "ok ban", "ok nhe"
  ];

  return endKeywords.some(keyword => normalizedMsg.includes(keyword));
}

// ====== DETECT ANGRY CUSTOMER ======
const complaintSynonyms = {
  "không hài lòng": ["ko hài lòng", "k hài lòng", "bất mãn", "không ok", "k ok", "k đồng ý"],
  "dịch vụ kém": ["dv kém", "dịch vụ tệ", "dịch vụ không tốt", "dịch vụ chán", "dịch vụ không ổn"],
  "bực mình": ["bực bội", "bực quá", "ức chế", "chán ghê", "tức"],
  "phàn nàn": ["than phiền", "complain", "méc", "mách", "khiếu nại"],
  "giải thích": ["trả lời rõ", "nói lại", "hướng dẫn lại", "nói rõ ra"],
  "có ai ở đó không": ["ai ở đó", "có ai ko", "có người không", "alo có ai"],
  "gặp người tư vấn": ["tư vấn viên đâu", "người thật đâu", "cho gặp admin", "muốn nói chuyện với người"],
  "bot dở quá": ["bot ngu", "bot kém", "bot chán", "bot tệ"]
};

function isAngryCustomer(message) {
  if (!message) return false;

  const normalizedMsg = message
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[!.,?~]/g, "")
    .trim();

  for (const key in complaintSynonyms) {
    if (normalizedMsg.includes(key)) return true;

    for (const synonym of complaintSynonyms[key]) {
      if (normalizedMsg.includes(synonym)) return true;
    }
  }

  return false;
}

// ====== FIND FLOW MATCH ======
function findFlow(userMessage) {
  const msg = userMessage.toLowerCase();

  return flowData.find(item => {
    if (!item.trigger_keywords || !Array.isArray(item.trigger_keywords)) {
      return false;
    }

    return item.trigger_keywords.some(trigger => msg.includes(trigger));
  });
}

// ====== WEBHOOK XỬ LÝ ======
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async function (entry) {
      const webhook_event = entry.messaging[0];
      const senderId = webhook_event.sender.id;

      const message = webhook_event.message?.text?.trim();
      if (!message) return;

      console.log(`💬 [${senderId}] ${message}`);

      // ========= Handoff im lặng =========
      if (handoffUsers.has(senderId)) {
        console.log(`🙊 User ${senderId} handoff cho CSKH, im lặng.`);
        return;
      }

      // ========= Kiểm tra completed session =========
      if (completedUsers.has(senderId)) {
        // Nếu KHÔNG phải câu chốt ➜ mở lại session ngay
        if (!isEndConversation(message)) {
          completedUsers.delete(senderId);
          console.log(`🔄 User ${senderId} quay lại hỏi thêm, bot tiếp tục!`);
        } else {
          console.log(`🤫 User ${senderId} đã chốt, im lặng tiếp.`);
          return;
        }
      }

      // ========= Phàn nàn / cần gặp người thật =========
      if (isAngryCustomer(message)) {
        await messengerService.sendMessage(senderId, {
          text: "Dạ em xin lỗi chị về sự bất tiện ạ! Để em chuyển thông tin cho bạn tư vấn viên hỗ trợ ngay nha!"
        });

        handoffUsers.add(senderId);
        console.log(`🚨 Handoff user ${senderId} cho CSKH.`);
        return;
      }

      // ========= Kết thúc trò chuyện =========
      if (isEndConversation(message)) {
        await messengerService.sendMessage(senderId, {
          text: "Dạ em cảm ơn chị, chúc chị một ngày tốt lành ạ!"
        });

        completedUsers.add(senderId);
        console.log(`✅ User ${senderId} đã chốt, im lặng.`);
        return;
      }

      // ========= Câu hỏi quá ngắn =========
      if (message.length < 3) {
        await messengerService.sendMessage(senderId, {
          text: "Dạ chị hỏi rõ hơn giúp em với ạ! Hoặc chị để lại số điện thoại/Zalo/Viber để em tư vấn kỹ hơn nha!"
        });
        return;
      }

      // ========= Số điện thoại =========
      const phoneRegexVN = /(0[3|5|7|8|9])+([0-9]{8})\b/;
      const phoneRegexInternational = /^\+(?:[0-9] ?){6,14}[0-9]$/;

      if (phoneRegexVN.test(message) || phoneRegexInternational.test(message)) {
        if (!isValidPhoneNumber(message)) {
          await messengerService.sendMessage(senderId, {
            text: "Dạ em kiểm tra chưa đúng định dạng số điện thoại rồi ạ. Chị kiểm tra lại hoặc để lại số Zalo/Viber giúp em để tư vấn ngay nha!"
          });
          return;
        }

        await messengerService.sendMessage(senderId, {
          text: "Dạ em ghi nhận thông tin rồi nha chị! Bạn Ngân - trợ lý bác sĩ sẽ liên hệ ngay với mình ạ!"
        });

        completedUsers.add(senderId);
        console.log(`🎉 Lead khách để lại số: ${message}`);
        return;
      }

      // ========= Tiếng Anh? =========
      const isEnglish = /^[A-Za-z0-9 ?!.]+$/.test(message);
      if (isEnglish) {
        await messengerService.sendMessage(senderId, {
          text: "Hi, may I know which service you are interested in? Please leave your Zalo/Viber/WhatsApp so our assistant Ms. Ngan can contact you soon!"
        });
        return;
      }

      // ========= Flow dịch vụ =========
      const matchedFlow = findFlow(message);
      if (matchedFlow) {
        await messengerService.sendMessage(senderId, { text: matchedFlow.action_response });

        if (matchedFlow.next_step && matchedFlow.next_step.trim() !== "") {
          await messengerService.sendMessage(senderId, { text: matchedFlow.next_step });
        }

        return;
      }

      // ========= Không khớp gì ➜ xin lại SĐT =========
      await messengerService.sendMessage(senderId, {
        text: "Dạ chị có thể để lại SĐT Zalo/Viber để bạn Ngân - trợ lý bác sĩ có thể trao đổi, tư vấn chi tiết cho chị được không ạ?"
      });

    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// ====== VERIFY WEBHOOK FACEBOOK ======
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// ====== START SERVER ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
