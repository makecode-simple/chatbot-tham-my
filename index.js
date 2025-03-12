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
    // Nếu không có trigger_keywords thì bỏ qua
    if (!item.trigger_keywords || !Array.isArray(item.trigger_keywords)) {
      return false;
    }

    // Kiểm tra từng trigger có trong câu hỏi không
    return item.trigger_keywords.some(trigger => msg.includes(trigger));
  });
}

// Regex kiểm tra SĐT Việt Nam
const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/;

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

        // Kiểm tra câu hỏi ngắn không có ý nghĩa
        if (message.length < 3) {
          await messengerService.sendMessage(senderId, {
            text: "Dạ chị hỏi rõ hơn giúp em với ạ! Hoặc chị để lại số điện thoại/Zalo để em tư vấn kỹ hơn nha!"
          });
          return;
        }

        // Kiểm tra nếu khách để lại SĐT trực tiếp
        if (phoneRegex.test(lowerCaseMessage)) {
          await messengerService.sendMessage(senderId, {
            text: "Dạ em ghi nhận thông tin rồi nha chị! Bạn tư vấn viên sẽ liên hệ ngay cho mình ạ!"
          });

          // TODO: Đẩy thông tin qua CRM hoặc Google Sheet ở đây
          console.log("Lead khách để lại số:", message);

          return;
        }

        // Kiểm tra flow trigger
        const matchedFlow = findFlow(message);

        if (matchedFlow) {
          // Trả lời action_response từ JSON
          await messengerService.sendMessage(senderId, { text: matchedFlow.action_response });

          // Nếu có next_step, gửi thêm
          if (matchedFlow.next_step && matchedFlow.next_step.trim() !== "") {
            await messengerService.sendMessage(senderId, { text: matchedFlow.next_step });
          }

          return;
        }

        // Không khớp trigger nào và chưa có SĐT
        await messengerService.sendMessage(senderId, {
          text: "Dạ chị đang hỏi về dịch vụ gì ạ? Để rõ hơn, chị để lại số điện thoại/Zalo, bên em tư vấn ngay cho mình nha!"
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
