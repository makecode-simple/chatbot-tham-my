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

// Regex kiểm tra SĐT Việt Nam và quốc tế dạng cơ bản
const phoneRegexVN = /(0[3|5|7|8|9])+([0-9]{8})\b/;
const phoneRegexInternational = /^\+(?:[0-9] ?){6,14}[0-9]$/;

// FULL mã quốc gia quốc tế chuẩn E.164
const countryCodes = [
  "+1", "+7", "+20", "+27", "+30", "+31", "+32", "+33", "+34", "+36", "+39",
  "+40", "+41", "+43", "+44", "+45", "+46", "+47", "+48", "+49", "+51", "+52",
  "+53", "+54", "+55", "+56", "+57", "+58", "+60", "+61", "+62", "+63", "+64",
  "+65", "+66", "+81", "+82", "+84", "+86", "+90", "+91", "+92", "+93", "+94",
  "+95", "+98", "+212", "+213", "+216", "+218", "+220", "+221", "+222", "+223",
  "+224", "+225", "+226", "+227", "+228", "+229", "+230", "+231", "+232", "+233",
  "+234", "+235", "+236", "+237", "+238", "+239", "+240", "+241", "+242", "+243",
  "+244", "+245", "+246", "+247", "+248", "+249", "+250", "+251", "+252", "+253",
  "+254", "+255", "+256", "+257", "+258", "+260", "+261", "+262", "+263", "+264",
  "+265", "+266", "+267", "+268", "+269", "+290", "+291", "+297", "+298", "+299",
  "+350", "+351", "+352", "+353", "+354", "+355", "+356", "+357", "+358", "+359",
  "+370", "+371", "+372", "+373", "+374", "+375", "+376", "+377", "+378", "+379",
  "+380", "+381", "+382", "+383", "+385", "+386", "+387", "+389", "+420", "+421",
  "+423", "+500", "+501", "+502", "+503", "+504", "+505", "+506", "+507", "+508",
  "+509", "+590", "+591", "+592", "+593", "+594", "+595", "+596", "+597", "+598",
  "+599", "+670", "+672", "+673", "+674", "+675", "+676", "+677", "+678", "+679",
  "+680", "+681", "+682", "+683", "+685", "+686", "+687", "+688", "+689", "+690",
  "+691", "+692", "+850", "+852", "+853", "+855", "+856", "+870", "+880", "+886",
  "+960", "+961", "+962", "+963", "+964", "+965", "+966", "+967", "+968", "+970",
  "+971", "+972", "+973", "+974", "+975", "+976", "+977", "+992", "+993", "+994",
  "+995", "+996", "+998"
];

// Hàm kiểm tra SĐT hợp lệ (VN + Quốc tế full code)
function isValidPhoneNumber(message) {
  if (!phoneRegexVN.test(message) && !phoneRegexInternational.test(message)) {
    return false;
  }

  if (phoneRegexInternational.test(message)) {
    return countryCodes.some(code => message.startsWith(code));
  }

  return true;
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

        // Kiểm tra câu hỏi quá ngắn
        if (message.length < 3) {
          await messengerService.sendMessage(senderId, {
            text: "Dạ chị hỏi rõ hơn giúp em với ạ! Hoặc chị để lại số điện thoại/Zalo/Viber để em tư vấn kỹ hơn nha!"
          });
          return;
        }

        // Nếu khách nhập số điện thoại
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

          console.log("Lead khách để lại số:", message);
          return;
        }

        // Detect English message
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

        // Không khớp trigger, chưa có SĐT ➡️ Xin Zalo/Viber
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
