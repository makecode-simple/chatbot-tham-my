const express = require("express");
const bodyParser = require("body-parser");
const messengerService = require("./messengerService");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());

// Load JSON flow dịch vụ và thông tin chung
const flowData = JSON.parse(fs.readFileSync("Flow_Full_Services_DrHoCaoVu.json"));

// Hàm tìm flow trigger
function findFlow(userMessage) {
  const msg = userMessage.toLowerCase();

  return flowData.find(item => {
    return item.trigger_keywords.some(trigger => msg.includes(trigger));
  });
}

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

        // Câu quá ngắn hoặc vô nghĩa
        if (message.length < 3) {
          await messengerService.sendMessage(senderId, {
            text: "Dạ chị hỏi rõ hơn giúp em với ạ! Hoặc chị để lại số điện thoại/Zalo để em tư vấn kỹ hơn nha!"
          });
          return;
        }

        const matchedFlow = findFlow(message);

        if (matchedFlow) {
          await messengerService.sendMessage(senderId, { text: matchedFlow.action_response });

          if (matchedFlow.next_step && matchedFlow.next_step.trim() !== "") {
            await messengerService.sendMessage(senderId, { text: matchedFlow.next_step });
          }

          return;
        }

        // Nếu không khớp flow nào ➡️ fallback ChatGPT hoặc xin SĐT
        await messengerService.sendMessage(senderId, {
          text: "Dạ chị đang hỏi về dịch vụ gì ạ? Chị có thể nhắn rõ hơn giúp em không? Hoặc để lại số điện thoại/Zalo để bên em tư vấn chi tiết hơn nha!"
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

// Xác thực webhook
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

// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
