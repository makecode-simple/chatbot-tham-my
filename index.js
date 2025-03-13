const express = require("express");
const bodyParser = require("body-parser");
const messengerService = require("./messengerService");
const fs = require("fs");
const OpenAI = require("openai");

const app = express();
app.use(bodyParser.json());

// ==== CONFIG GPT ====
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==== LOAD DATA ====
const flowData = JSON.parse(fs.readFileSync("Flow_Full_Services_DrHoCaoVu.json"));
const countryDigitRules = JSON.parse(fs.readFileSync("countryDigitRules.json"));
const countryCodes = Object.keys(countryDigitRules);

// ==== SESSION USERS ====
const completedUsers = new Set();
const handoffUsers = new Set();

// ====== GPT SENTIMENT ANALYSIS ======
async function analyzeSentimentWithGPT(message) {
  try {
    const prompt = `
Bạn là chuyên gia phân tích cảm xúc khách hàng.
Hãy phân loại cảm xúc đoạn chat sau vào 1 trong 3 loại:
- "negative" (tiêu cực, giận dữ, không hài lòng)
- "neutral" (bình thường)
- "positive" (tích cực, vui vẻ)

Đoạn chat: "${message}"

Trả lời chỉ 1 từ: negative, neutral, positive
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 5,
    });

    const sentiment = response.choices[0].message.content.trim().toLowerCase();
    console.log("🎯 GPT Sentiment:", sentiment);

    return sentiment;

  } catch (error) {
    console.error("❌ GPT Error:", error.message);
    return "neutral";
  }
}

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

// ====== RULE BASED COMPLAINT DETECTION ======
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

// ====== WEBHOOK HANDLER ======
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async function (entry) {
      const webhook_event = entry.messaging[0];
      const senderId = webhook_event.sender.id;

      const message = webhook_event.message?.text?.trim();
      if (!message) return;

      console.log(`💬 [${senderId}] ${message}`);

      // ====== 1. Handoff đã active ➜ Im lặng tuyệt đối
      if (handoffUsers.has(senderId)) {
        console.log(`🙊 User ${senderId} đã chuyển CSKH, bot im lặng.`);
        return;
      }

      // ====== 2. RULE-BASED COMPLAINT ➜ Handoff
      if (isAngryCustomer(message)) {
        await messengerService.sendMessage(senderId, {
          text: "Dạ em xin lỗi chị về sự bất tiện ạ! Em đã chuyển thông tin cho bạn tư vấn viên hỗ trợ ngay nha!"
        });

        handoffUsers.add(senderId);
        console.log(`🚨 [Rule] Handoff user ${senderId}`);
        return;
      }

      // ====== 3. GPT SENTIMENT CHECK ➜ Smart Handoff
      const sentiment = await analyzeSentimentWithGPT(message);

      if (sentiment === "negative") {
        await messengerService.sendMessage(senderId, {
          text: "Dạ em xin lỗi chị về sự bất tiện ạ! Bạn tư vấn viên sẽ liên hệ hỗ trợ ngay với mình nha!"
        });

        handoffUsers.add(senderId);
        console.log(`🚨 [GPT] Handoff user ${senderId}`);
        return;
      }

      // ====== 4. Completed user ➜ kiểm tra quay lại
      if (completedUsers.has(senderId)) {
        if (!isEndConversation(message)) {
          completedUsers.delete(senderId);
          console.log(`🔄 User ${senderId} quay lại hỏi tiếp!`);
        } else {
          console.log(`🤫 User ${senderId} đã chốt, im tiếp.`);
          return;
        }
      }

      // ====== 5. PHONE CHECK
      const phoneRegexVN = /(0[3|5|7|8|9])+([0-9]{8})\b/;
      const phoneRegexInternational = /^\+(?:[0-9] ?){6,14}[0-9]$/;

      if (phoneRegexVN.test(message) || phoneRegexInternational.test(message)) {
        if (!isValidPhoneNumber(message)) {
          await messengerService.sendMessage(senderId, {
            text: "Dạ số điện thoại chị nhập chưa đúng định dạng ạ. Số Việt Nam cần đủ 10 số hoặc theo dạng +84. Chị kiểm tra lại giúp em nhé!"
          });
          return;
        }

        await messengerService.sendMessage(senderId, {
          text: "Dạ em ghi nhận thông tin rồi nha chị! Bạn Ngân - trợ lý bác sĩ sẽ liên hệ ngay với mình ạ!"
        });

        completedUsers.add(senderId);
        return;
      }

      // ====== 6. ENGLISH DETECT
      const isEnglish = /^[A-Za-z0-9 ?!.]+$/.test(message);
      if (isEnglish) {
        await messengerService.sendMessage(senderId, {
          text: "Hi, may I know which service you are interested in? Please leave your Zalo/Viber/WhatsApp so our assistant Ms. Ngan can contact you soon!"
        });
        return;
      }

      // ====== 7. END CONVERSATION DETECT
      if (isEndConversation(message)) {
        await messengerService.sendMessage(senderId, {
          text: "Dạ em cảm ơn chị, chúc chị một ngày tốt lành ạ!"
        });

        completedUsers.add(senderId);
        return;
      }

      // ====== 8. MESSAGE TOO SHORT
      if (message.length < 3) {
        await messengerService.sendMessage(senderId, {
          text: "Dạ chị hỏi rõ hơn giúp em với ạ! Hoặc chị để lại số điện thoại/Zalo/Viber để em tư vấn kỹ hơn nha!"
        });
        return;
      }

      // ====== 9. FLOW KEYWORD DETECT
      const matchedFlow = findFlow(message);
      if (matchedFlow) {
        await messengerService.sendMessage(senderId, { text: matchedFlow.action_response });

        if (matchedFlow.next_step && matchedFlow.next_step.trim() !== "") {
          await messengerService.sendMessage(senderId, { text: matchedFlow.next_step });
        }

        return;
      }

      // ====== 10. DEFAULT ASK FOR PHONE
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
