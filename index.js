const express = require("express");
const bodyParser = require("body-parser");
const messengerService = require("./messengerService");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());

// Load dữ liệu
const flowData = JSON.parse(fs.readFileSync("Flow_Full_Services_DrHoCaoVu.json"));
const countryDigitRules = JSON.parse(fs.readFileSync("countryDigitRules.json"));
const countryCodes = Object.keys(countryDigitRules);

// Danh sách user đã kết thúc trò chuyện
const completedUsers = new Set();

// === HÀM XỬ LÝ PHONE === //
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

// === HÀM PHÁT HIỆN KẾT THÚC TRÒ CHUYỆN === //
function isEndConversation(message) {
  if (!message) return false;

  const normalizedMsg = message
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
    .replace(/[!.,?~]/g, "") // bỏ ký tự đặc biệt
    .trim();

  // Từ khóa "chốt" linh hoạt
  const endKeywords = [
    "ok", "oke", "okie", "okei", "okey",
    "cam on", "cảm ơn", "thanks", "thank you",
    "duoc roi", "được rồi", "dong y", "dạ rồi", "yes", "vâng", "uầy", "rồi nha",
    "roi nhe", "oke roi", "ok ban", "ok nhe"
  ];

  return endKeywords.some(keyword => normalizedMsg.includes(keyword));
}

// === HÀM TÌM FLOW === //
function findFlow(userMessage) {
  const msg = userMessage.toLowerCase();

  return flowData.find(item => {
    if (!item.trigger_keywords || !Array.isArray(item.trigger_keywords)) {
      return false;
    }

    return item.trigger_keywords.some(trigger => msg.includes(trigger));
  });
}

// === WEBHOOK XỬ LÝ === //
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async function (entry) {
      const webhook_event = entry.messaging[0];
      const senderId = webhook_event.sender.id;

      // Nếu user đã kết thúc -> im lặng
      if (completedUsers.has(senderId)) {
        console.log(`🤫 Người dùng ${senderId} đã kết thúc, im lặng!`);
        return;
      }

      const message = webhook_event.message?.text?.trim();
      if (!message) return;

      console.log(`💬 [${senderId}] ${message}`);

      const lowerCaseMessage = message.toLowerCase();

      // Kiểm tra kết thúc trò chuyện
      if (isEndConversation(message)) {
        await messengerService.sendMessage(senderId, {
          text: "Dạ em cảm ơn chị, chúc chị một ngày tốt lành ạ!"
        });

        completedUsers.add(senderId); // đánh dấu kết thúc
        return;
      }

      // Kiểm tra độ dài tin nhắn quá ngắn
      if (message.length < 3) {
        await messengerService.sendMessage(senderId, {
          text: "Dạ chị hỏi rõ hơn giúp em với ạ! Hoặc chị để lại số điện thoại/Zalo/Viber để em tư vấn kỹ hơn nha!"
        });
        return;
      }

      // Kiểm tra SĐT
      const phoneRegexVN = /(0[3|5|7|8|9])+([0-9]{8})\b/;
      const phoneRegexInternational = /^\+(?:[0-9] ?){6,14}[0-9]$/;

      if (phoneRegexVN.test(lowerCaseMessage) || phoneRegexInternational.test(lowerCaseMessage)) {
        if (!isValidPhoneNumber(message)) {
          await messengerService.sendMessage(senderId, {
            text: "Dạ em kiểm tra chưa đúng định dạng số điện thoại rồi ạ. Chị kiểm tra lại hoặc để lại số Zalo/Viber giúp em để tư vấn ngay nha!"
          });
          return;
        }

        await messengerService.sendMessage(senderId, {
          text: "Dạ em ghi nhận thông tin rồi nha chị! Bạn Ngân - trợ lý bác sĩ sẽ liên hệ ngay với mình ạ!"
        });

        completedUsers.add(senderId); // chốt luôn sau khi nhận SĐT
        console.log(`🎉 Lead khách để lại số: ${message}`);
        return;
      }

      // Kiểm tra tiếng Anh
      const isEnglish = /^[A-Za-z0-9 ?!.]+$/.test(message);
      if (isEnglish) {
        await messengerService.sendMessage(senderId, {
          text: "Hi, may I know which service you are interested in? Please leave your Zalo/Viber/WhatsApp so our assistant Ms. Ngan can contact you soon!"
        });
        return;
      }

      // Kiểm tra trigger keywords
      const matchedFlow = findFlow(message);
      if (matchedFlow) {
        await messengerService.sendMessage(senderId, { text: matchedFlow.action_response });

        if (matchedFlow.next_step && matchedFlow.next_step.trim() !== "") {
          await messengerService.sendMessage(senderId, { text: matchedFlow.next_step });
        }

        return;
      }

      // Không khớp gì ➜ xin lại SĐT
      await messengerService.sendMessage(senderId, {
        text: "Dạ chị có thể để lại SĐT Zalo/Viber để bạn Ngân - trợ lý bác sĩ có thể trao đổi, tư vấn chi tiết cho chị được không ạ?"
      });

    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Xác thực webhook Facebook
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

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
