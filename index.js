const express = require("express");
const bodyParser = require("body-parser");
const messengerService = require("./messengerService");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());

// Load JSON flow dịch vụ và thông tin chung
const flowData = JSON.parse(fs.readFileSync("Flow_Full_Services_DrHoCaoVu.json"));

// Hàm tìm flow trigger chính xác
function findFlow(userMessage) {
  const msg = userMessage.toLowerCase();

  return flowData.find(item => {
    if (!item.trigger_keywords || !Array.isArray(item.trigger_keywords)) {
      return false;
    }

    return item.trigger_keywords.some(trigger => msg.includes(trigger));
  });
}

// Regex kiểm tra SĐT Việt Nam và quốc tế
const phoneRegexVN = /(0[3|5|7|8|9])+([0-9]{8})\b/;
const phoneRegexInternational = /^\+(?:[0-9] ?){6,14}[0-9]$/;

// Webhook nhận tin nhắn từ Messenger
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async function (entry) {
      const webhook_event = entry.messaging[0];
      const senderId = webhook_event.sender.id;

      if (webhook_event.message && webhook_event.message.text) {
        const message = webhook_event.message.text.trim();
        const lowerCaseMessage = message.toLowerCase();

        console.log("Received message:", message);

        // Kiểm tra câu hỏi quá ngắn
        if (message.length < 3) {
          await messengerService.sendMessage(senderId, {
            text: "Dạ chị hỏi rõ hơn giúp em với ạ! Hoặc chị để lại số điện thoại/Zalo/Viber để em tư vấn kỹ hơn nha!"
          });
          return;
        }

        // Kiểm tra nếu khách để lại số ĐT VN hoặc quốc tế
        if (phoneRegexVN.test(lowerCaseMessage) || phoneRegexInternational.test(lowerCaseMessage)) {
          await messengerService.sendMessage(senderId, {
            text: "Dạ em ghi nhận thông tin rồi nha chị! Bạn Ngân - trợ lý bác sĩ sẽ liên hệ ngay với mình ạ!"
          });

          console.log("Lead khách để lại số:", message);
          return;
        }

        // Detect English message (to reply in English)
        const isEnglish = /^[A-Za-z0-9 ?!.]+$/.test(message);

        if (isEnglish) {
          await messengerService.sendMessage(senderId, {
            text: "Hi, may I know which service you are interested in? Please leave your Zalo/Viber/WhatsApp so our assistant Ms. Ngan can contact you soon!"
          });
          return;
        }

        // Kiểm tra flow trigger từ JSON
        const matchedFlow = findFlow(message);

        if (matchedFlow) {
          await messengerService.sendMessage(senderId, { text: matchedFlow.action_response });

          if (matchedFlow.next_step && matchedFlow.next_step.trim() !== "") {
            await messengerService.sendMessage(senderId, { text: matchedFlow.next_step });
          }

          return;
        }

        // Không khớp trigger, chưa có SĐT ➡️ Xin Zalo/Viber để nhân viên hỗ trợ
        await messengerService.sendMessage(senderId, {
          text: "Dạ chị có thể để lại SĐT Zalo/Viber để bạn Ngân - trợ lý bác sĩ có thể trao đổi, tư vấn chi tiết cho chị được không ạ?"
        });

      } else {
        console.log("Sự kiện không phải tin nhắn, bỏ qua!");
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Xác thực webhook với Facebook
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

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
