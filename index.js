// ====== IMPORTS ======
const express = require('express');
const bodyParser = require('body-parser');
const messengerService = require('./messengerService');
const { handleIntent } = require('./nlp/intentHandler');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { predictIntent } = require('./intentEngine');
const { 
    sendNangNgucFlow,
    sendThaoTuiNgucFlow,
    sendNangMuiFlow,
    sendThamMyMatFlow,
    sendHutMoBungFlow,
    sendThamMyVungKinFlow,
    sendCangDaMatFlow,
    sendThamMyCamFlow,
    sendTreoCungMayFlow,
    sendTaiTaoVuFlow,
    sendTaoHinhThanhBungFlow,
    sendChinhMatLoiFlow,
    sendChinhMuiLoiFlow,
    sendHutMoBodyFlow,
    sendCangChiDaMatFlow,
    sendDonThaiDuongFlow,
    sendHutMoTiemLenMatFlow,
    sendDiaChiFlow,
    sendMenuDichVu,
    sendBangGiaOnlyFlow,
    sendMenuBangGia
} = require('./servicesFlow');

// ====== APP INIT ======
const app = express();
app.use(bodyParser.json());

// ====== CONFIG OPENAI ======

// ====== CONFIG CLOUDINARY ======
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ====== LOAD DATA ======
const flowFullServicesRaw = JSON.parse(fs.readFileSync('./Flow_Full_Services_DrHoCaoVu.json', 'utf-8'));

const flowFullServices = {
  ...flowFullServicesRaw,
  faqs: flowFullServicesRaw.faqs.map(item => ({
    questions: item.questions.map(q => normalizeText(q)),
    answer: item.answer
  }))
};

const countryDigitRules = JSON.parse(fs.readFileSync('./data/countryDigitRules.json', 'utf-8'));

// ====== SESSION USERS ======
const completedUsers = new Set();
const handoffUsers = new Set();

// ====== TEXT NORMALIZATION ======
function normalizeText(msg) {
  return msg?.toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/[!.,?~]/g, "")
    .trim() || "";
}

// ====== VALIDATE PHONE ======
const countryCodes = Object.keys(countryDigitRules);

function isValidPhoneNumber(message) {
  if (!message) return false;
  let cleanNumber = message.replace(/\\s|-/g, '');

  if (cleanNumber.startsWith('0')) {
    cleanNumber = '+84' + cleanNumber.slice(1);
  }

  if (!cleanNumber.startsWith('+')) return false;

  const countryCode = countryCodes.find(code => cleanNumber.startsWith(code));
  if (!countryCode) {
    const genericPhone = /^\\+\\d{6,15}$/.test(cleanNumber);
    return genericPhone ? "unknown" : false;
  }

  const numberWithoutCode = cleanNumber.slice(countryCode.length);
  const digitRule = countryDigitRules[countryCode];
  if (!digitRule) return false;

  const length = numberWithoutCode.length;
  return length >= digitRule.min && length <= digitRule.max;
}
// Remove ChatGPT section
// ====== CLOUDINARY FUNCTIONS ======
async function getFeedbackImages(folder) {
  try {
    const result = await cloudinary.search
      .expression(`folder:feedback/${folder} AND resource_type:image`)
      .sort_by('public_id', 'desc')
      .max_results(10)
      .execute();

    return result.resources.map(file => file.secure_url);
  } catch (error) {
    console.error('❌ Cloudinary fetch error:', error);
    return [];
  }
}

async function getBangGiaImage(publicId) {
  try {
    const result = await cloudinary.search
      .expression(`folder:banggia AND public_id:${publicId} AND resource_type:image`)
      .max_results(1)
      .execute();

    return result.resources[0]?.secure_url || null;
  } catch (error) {
    console.error('❌ Cloudinary fetch bảng giá error:', error);
    return null;
  }
}
// Remove this line
// const { handleUserMessage } = require('./messengerService');

// Continue with webhook route
// ====== WEBHOOK ROUTE ======
// Remove this duplicate webhook handler
// app.post("/webhook", async (req, res) => {
//   const body = req.body;
//   if (body.object === 'page') {
//     body.entry.forEach(async function(entry) {
//       const webhookEvent = entry.messaging[0];
//       const senderId = webhookEvent.sender.id;
//       const message = webhookEvent.message?.text;

//       if (message) {
//         const result = await predictIntent(message);

//         if (result.intent === 'nang_nguc') {
//           await sendNangNgucFlow(senderId);
//         } else if (result.intent === 'nang_mui') {
//           await sendNangMuiFlow(senderId);
//         } else if (result.intent === 'faq') {
//           await handleFollowUp(senderId, message);
//         } else {
//           await messengerService.sendMessage(senderId, {
//             text: "Dạ chị ơi, em chưa rõ mình cần tư vấn dịch vụ nào ạ. Chị nói rõ giúp em nha!"
//           });
//         }
//       }
//     });
//     res.status(200).send('EVENT_RECEIVED');
//   } else {
//     res.sendStatus(404);
//   }
// });

// Keep only this MAIN WEBHOOK HANDLER
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object !== "page") {
    return res.sendStatus(404);
  }

  for (const entry of body.entry) {
    const webhook_event = entry.messaging[0];

    if (!webhook_event.message || !webhook_event.message.text) {
      console.log("❌ Không có message text");
      continue;
    }

    const sender_psid = webhook_event.sender.id;
    const message = webhook_event.message.text.trim();
    const textMessage = normalizeText(message);

    try {
      // 1️⃣ Kiểm tra số điện thoại
      if (isValidPhoneNumber(message)) {
        completedUsers.add(sender_psid);
        await messengerService.sendMessage(sender_psid, {
          text: "Dạ em ghi nhận thông tin rồi ạ! Bạn Ngân - trợ lý bác sĩ sẽ liên hệ ngay với mình nha chị!"
        });
        continue;
      }

      // 2️⃣ Các flow dịch vụ
      const serviceKeywords = [
          // Add menu service keywords
          {
              keywords: [
                  "menu", "dich vu", "dịch vụ",
                  "dich vu la gi", "dịch vụ là gì",
                  "xin thong tin dich vu", "xin thông tin dịch vụ",
                  "tong quan dich vu", "tổng quan dịch vụ",
                  "danh sach dich vu", "danh sách dịch vụ",
                  "list dich vu", "list services", "lixt dv", 
                  "list dih vu", "the loai dich vụ", "loại hình dịch vụ",
                  "thong tin dich vu", "o day co gi", "ben em co gi",
                  "bên đây có gì", "bác vũ có dịch vụ nào", "bác vũ có gì",
                  "bên bác làm gì", "ben bac lam dv gi",
                  "các gói dịch vụ", "goi dv", "thông tin dịch vụ"
              
              ],
              action: sendMenuDichVu
          },
          { 
              keywords: ["nang nguc", "nâng ngực", "dat tui nguc", "đặt túi ngực", "don nguc", "độn ngực"], 
              action: sendNangNgucFlow 
          },
          { 
              keywords: [
                  "dia chi", "địa chỉ", "d/c", "address", "add",
                  "cho kham", "chỗ khám", "van phong", "văn phòng",
                  "co so", "cơ sở", "dia diem", "địa điểm",
                  "noi kham", "nơi khám"
              ], 
              action: sendDiaChiFlow 
          },
          { keywords: ["thao tui nguc", "tháo túi ngực"], action: sendThaoTuiNgucFlow },
          { keywords: ["nang mui", "nâng mũi"], action: sendNangMuiFlow },
          { keywords: ["cat mi", "cắt mí", "tham my mat", "thẩm mỹ mắt"], action: sendThamMyMatFlow },
          { keywords: ["hut mo bung", "hút mỡ bụng"], action: sendHutMoBungFlow },
          { keywords: ["tham my vung kin", "thẩm mỹ vùng kín"], action: sendThamMyVungKinFlow },
          { keywords: ["cang da mat", "căng da mặt"], action: sendCangDaMatFlow },
          { keywords: ["tham my cam", "thẩm mỹ cằm", "don cam", "độn cằm"], action: sendThamMyCamFlow },
          { keywords: ["treo cung may", "treo cung mày"], action: sendTreoCungMayFlow },
          { keywords: ["tai tao vu", "tái tạo vú", "ung thu vu", "ung thư vú"], action: sendTaiTaoVuFlow },
          { keywords: ["tao hinh thanh bung", "tạo hình thành bụng"], action: sendTaoHinhThanhBungFlow },
          { keywords: ["chinh mat loi", "chỉnh mắt lỗi"], action: sendChinhMatLoiFlow },
          { keywords: ["chinh mui loi", "chỉnh mũi lỗi"], action: sendChinhMuiLoiFlow },
          { keywords: ["hut mo tay", "hút mỡ tay", "hut mo dui", "hút mỡ đùi", "hut mo lung", "hút mỡ lưng"], action: sendHutMoBodyFlow },
          { keywords: ["cang chi da mat", "căng chỉ da mặt", "prp tre hoa", "prp trẻ hóa"], action: sendCangChiDaMatFlow },
          { keywords: ["don thai duong", "độn thái dương"], action: sendDonThaiDuongFlow },
          { keywords: ["hut mo tiem len mat", "hút mỡ tiêm lên mặt"], action: sendHutMoTiemLenMatFlow }
      ];
      let serviceMatched = false;
      for (const service of serviceKeywords) {
        if (service.keywords.some(keyword => textMessage.includes(keyword))) {
          await service.action(sender_psid);
          serviceMatched = true;
          break;
        }
      }

      if (serviceMatched) continue;

      // 3️⃣ Xin bảng giá only
      if (textMessage.includes("bảng giá")) {
        await sendBangGiaOnlyFlow(sender_psid, "cacdichvu");
        continue;
      }

      // 4️⃣ Lời chào và menu dịch vụ
      const loiChaoKeywords = ["hi", "hello", "alo", "xin chao", "toi can tu van", "can tu van", "menu", "thong tin dich vu khac"];
      if (loiChaoKeywords.includes(textMessage)) {
        const intent = await predictIntent(message);
        switch(intent) {
          case 'gia_nang_nguc':
            await sendBangGiaOnlyFlow(sender_psid, 'nguc');
            break;
          case 'gia_nang_mui':
            await sendBangGiaOnlyFlow(sender_psid, 'mui');
            break;
          case 'gia_mat':
            await sendBangGiaOnlyFlow(sender_psid, 'mat');
            break;
          case 'gia_tham_my_cam':
            await sendBangGiaOnlyFlow(sender_psid, 'mat');
            break;
          case 'gia_hut_mo':
            await sendBangGiaOnlyFlow(sender_psid, 'bung');
            break;
          case 'gia_cang_da':
            await sendBangGiaOnlyFlow(sender_psid, 'damat');
            break;
          case 'gia_vung_kin':
            await sendBangGiaOnlyFlow(sender_psid, 'vungkin');
            break;
          case 'hoi_gia':
            await sendMenuBangGia(sender_psid);
            break;
          default:
            await sendMenuDichVu(sender_psid);
        }
      }
    } catch (error) {
      console.error('❌ Error processing message:', error);
      await messengerService.sendMessage(sender_psid, {
        text: "Xin lỗi chị, hiện tại hệ thống đang bận. Chị vui lòng thử lại sau ạ!"
      });
    }
  }
  
  res.status(200).send("EVENT_RECEIVED");
});

// ====== VERIFY WEBHOOK ======
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});