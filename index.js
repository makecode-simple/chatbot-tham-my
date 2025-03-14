// ====== IMPORTS ======
const express = require('express');
const bodyParser = require('body-parser');
const messengerService = require('./messengerService');
const fs = require('fs');
const OpenAI = require('openai');
const cloudinary = require('cloudinary').v2;

// ====== APP INIT ======
const app = express();
app.use(bodyParser.json());

// ====== CONFIG OPENAI ======
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ====== CONFIG CLOUDINARY ======
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ====== LOAD DATA ======
const countryDigitRules = JSON.parse(fs.readFileSync('./data/countryDigitRules.json', 'utf-8'));
const flowFullServicesRaw = JSON.parse(fs.readFileSync('./Flow_Full_Services_DrHoCaoVu.json', 'utf-8'));

const flowFullServices = {
  ...flowFullServicesRaw,
  faqs: flowFullServicesRaw.faqs.map(item => ({
    questions: item.questions.map(q => normalizeText(q)),
    answer: item.answer
  }))
};

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
  let cleanNumber = message.replace(/\s|-/g, '');

  if (cleanNumber.startsWith('0')) {
    cleanNumber = '+84' + cleanNumber.slice(1);
  }

  if (!cleanNumber.startsWith('+')) return false;

  const countryCode = countryCodes.find(code => cleanNumber.startsWith(code));
  if (!countryCode) {
    const genericPhone = /^\+\d{6,15}$/.test(cleanNumber);
    return genericPhone ? "unknown" : false;
  }

  const numberWithoutCode = cleanNumber.slice(countryCode.length);
  const digitRule = countryDigitRules[countryCode];
  if (!digitRule) return false;

  const length = numberWithoutCode.length;
  return length >= digitRule.min && length <= digitRule.max;
}

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

// ====== FLOW: MENU DỊCH VỤ ======
async function sendMenuDichVu(sender_psid) {
  const menuText = `Dạ chào chị, chị muốn tư vấn dịch vụ thẩm mỹ tạo hình nào dưới đây ạ:\n
* Phẫu thuật nâng ngực/ tháo túi ngực/ bóc bao xơ\n
* Tái tạo vú sau khi điều trị ung thư\n
* Hút mỡ bụng, tạo hình thành bụng sau sinh\n
* Tiểu phẫu cắt mí\n
* Tiểu phẫu treo cung mày\n
* Chỉnh mắt lỗi\n
* Nâng mũi tái cấu trúc/ nâng mũi sụn sườn\n
* Chỉnh mũi lỗi\n
* Phẫu thuật căng da mặt\n
* Hút mỡ bụng/tay/ đùi/ lưng\n
* Thẩm mỹ vùng kín\n
* Căng da mặt toàn diện\n
* Căng chỉ da mặt/ PRP trẻ hóa\n
* Độn thái dương/ độn cằm\n
* Hút mỡ tiêm lên mặt`;

  await messengerService.sendMessage(sender_psid, { text: menuText });
}

// ====== FLOW: NÂNG NGỰC ======
async function sendNangNgucFlow(sender_psid) {
  console.log("🚀 Trigger Nâng Ngực Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Dạ chào chị! Bên em chuyên Phẫu thuật nâng ngực bằng công nghệ hiện đại nhất, cam kết không đau, không để lại sẹo. Bác Vũ trực tiếp thực hiện.\n\n
Bên em áp dụng dao mổ siêu âm Ultrasonic Surgical Scalpel giúp:\n
1. Không đau\n
2. Không gây chảy máu\n
3. Không tiết dịch\n
4. Không gây co thắt bao xơ\n
5. Không cần nghỉ dưỡng\n
6. Không để lại sẹo`
  });

  const feedbackImages = await getFeedbackImages("nguc");

  for (const url of feedbackImages) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url, is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const bangGiaImage = await getBangGiaImage("banggia_nangnguc");

  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

// ====== FLOW: NÂNG MŨI ======
async function sendNangMuiFlow(sender_psid) {
  console.log("🚀 Trigger Nâng Mũi Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Dạ với hơn 10 năm kinh nghiệm, thẩm mỹ hơn 5000 ca mắt - mũi - ngực, chị yên tâm Bác sẽ đưa ra giải pháp tốt nhất phù hợp với khuôn mặt và cấu trúc giải phẫu chị.\n\n
Bên em áp dụng công nghệ Nâng mũi tái cấu trúc, sử dụng sụn sườn tự thân giúp dáng mũi cao, đẹp tự nhiên và duy trì lâu dài.`
  });

  const feedbackImages = await getFeedbackImages("mui");

  for (const url of feedbackImages) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url, is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const bangGiaImage = await getBangGiaImage("banggia_thammymui");

  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}
// ====== FLOW: THẨM MỸ MẮT ======
async function sendThamMyMatFlow(sender_psid) {
  console.log("🚀 Trigger Thẩm Mỹ Mắt Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Dạ với hơn 10 năm kinh nghiệm, thẩm mỹ hơn 5000 ca mắt - mũi - ngực, chị yên tâm Bác sẽ đưa ra giải pháp tốt nhất phù hợp với khuôn mặt và cấu trúc giải phẫu chị.\n\n
Em gửi hình ảnh 1 vài ca thẩm mỹ vùng mắt bác từng làm ạ!`
  });

  const feedbackImages = await getFeedbackImages("mat");

  for (const url of feedbackImages) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url, is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const bangGiaImage = await getBangGiaImage("banggia_thammymat");

  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

// ====== FLOW: THẨM MỸ CẰM ======
async function sendThamMyCamFlow(sender_psid) {
  console.log("🚀 Trigger Thẩm Mỹ Cằm Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Dạ chị ơi, chi phí thẩm mỹ cằm bên em từ 30-40 triệu tùy cấu trúc giải phẫu nha!\n\n
Bác sĩ sẽ kiểm tra và tư vấn chi tiết để mình có kết quả tự nhiên nhất ạ!`
  });

  const bangGiaImage = await getBangGiaImage("banggia_thammymat");

  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

// ====== FLOW: THẨM MỸ VÙNG KÍN ======
async function sendThamMyVungKinFlow(sender_psid) {
  console.log("🚀 Trigger Thẩm Mỹ Vùng Kín Flow");

  await messengerService.sendMessage(sender_psid, {
    text: "Em gửi bảng giá thẩm mỹ vùng kín chị tham khảo ạ!"
  });

  const bangGiaImage = await getBangGiaImage("banggia_thammyvungkan");

  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

// ====== FLOW: TREO CUNG MÀY ======
async function sendTreoCungMayFlow(sender_psid) {
  console.log("🚀 Trigger Treo Cung Mày Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Dạ em gửi các ca treo cung mày gần đây bác Vũ làm chị tham khảo ạ.\nKhông đau - Không sẹo - Không sưng bầm!`
  });

  const feedbackImages = await getFeedbackImages("mat");

  for (const url of feedbackImages) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url, is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const bangGiaImage = await getBangGiaImage("banggia_thammymat");

  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

// ====== FLOW: CHỈNH MŨI LỖI ======
async function sendChinhMuiLoiFlow(sender_psid) {
  console.log("🚀 Trigger Chỉnh Mũi Lỗi Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Dạ chị ơi, bên em chuyên chỉnh sửa các ca mũi lỗi như lệch, lộ sóng, bóng đỏ...\n\n
Bác sĩ sẽ kiểm tra trực tiếp và đưa ra phương pháp chỉnh sửa phù hợp nhất cho mình nha!`
  });

  const feedbackImages = await getFeedbackImages("mui");

  for (const url of feedbackImages) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url, is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const bangGiaImage = await getBangGiaImage("banggia_thammymui");

  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

// ====== FLOW: THÁO TÚI NGỰC ======
async function sendThaoTuiNgucFlow(sender_psid) {
  console.log("🚀 Trigger Tháo Túi Ngực Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Bác Vũ tháo túi ngực không đau, không cần nghỉ dưỡng.\nEm gửi chi phí tham khảo chị nha!`
  });

  const bangGiaImage = await getBangGiaImage("banggia_nangnguc");

  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}
// ====== FLOW: BẢNG GIÁ ONLY ======
async function sendBangGiaOnlyFlow(sender_psid, parentService) {
  console.log(`🚀 Trigger bảng giá only flow for ${parentService}`);

  const bangGiaMap = {
    "nguc": "banggia_nangnguc",
    "mui": "banggia_thammymui",
    "mat": "banggia_thammymat",
    "bung": "banggia_hutmobung",
    "vungkin": "banggia_thammyvungkan",
    "damat": "banggiathammy_damat",
    "cacdichvu": "banggia_cacdichvukhac"
  };

  const bangGiaPublicId = bangGiaMap[parentService];

  if (!bangGiaPublicId) {
    await messengerService.sendMessage(sender_psid, {
      text: "Dạ chị ơi, bên em sẽ gửi bảng giá chi tiết cho mình sau nhé!"
    });
    return;
  }

  const bangGiaImage = await getBangGiaImage(bangGiaPublicId);

  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  } else {
    await messengerService.sendMessage(sender_psid, {
      text: "Dạ chị ơi, hiện tại bên em chưa cập nhật bảng giá này trên hệ thống. Chị để lại số để em gửi chi tiết hơn ạ!"
    });
  }
}

// ====== FOLLOW UP QUESTION HANDLER ======
async function handleFollowUp(sender_psid, textMessage) {
  if (!flowFullServices || !flowFullServices.faqs) {
    console.log("❌ flowFullServices.faqs not found");
    return;
  }

const found = flowFullServices.faqs.find(item =>
  textMessage.includes(item.question) // ✅ khỏi cần normalize lại!
);

  if (found) {
    await messengerService.sendMessage(sender_psid, { text: found.answer });
  } else {
    handoffUsers.add(sender_psid);
    console.log(`🚀 Handoff triggered for ${sender_psid}`);
  }
}

// ====== MAIN WEBHOOK HANDLER ======
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object !== "page") {
    return res.sendStatus(404);
  }

  for (const entry of body.entry) {
    const webhook_event = entry.messaging[0];
    const senderId = webhook_event.sender.id;

    if (!webhook_event.message || !webhook_event.message.text) {
      console.log("❌ Không có message text");
      continue;
    }

    const message = webhook_event.message.text.trim();
    const textMessage = normalizeText(message);

    try {
      // 1️⃣ Kiểm tra số điện thoại
      if (isValidPhoneNumber(message)) {
        completedUsers.add(senderId);
        await messengerService.sendMessage(senderId, {
          text: "Dạ em ghi nhận thông tin rồi ạ! Bạn Ngân - trợ lý bác sĩ sẽ liên hệ ngay với mình nha chị!"
        });
        continue;
      }

      // 2️⃣ FAQ
      const foundFAQ = flowFullServices.faqs.find(item =>
        textMessage.includes(normalizeText(item.question))
      );

      if (foundFAQ) {
        await messengerService.sendMessage(senderId, { text: foundFAQ.answer });
        continue;
      }

      // 3️⃣ Các flow dịch vụ
      if (textMessage.includes("nang nguc") || textMessage.includes("nâng ngực")) {
        await sendNangNgucFlow(senderId);
        continue;
      }

      if (textMessage.includes("nang mui") || textMessage.includes("nâng mũi")) {
        await sendNangMuiFlow(senderId);
        continue;
      }

      if (
        textMessage.includes("cat mi") || textMessage.includes("cắt mí") ||
        textMessage.includes("treo cung may") || textMessage.includes("treo cung mày") ||
        textMessage.includes("tham my mat") || textMessage.includes("thẩm mỹ mắt")
      ) {
        await sendThamMyMatFlow(senderId);
        continue;
      }

      if (
        textMessage.includes("tham my cam") || textMessage.includes("thẩm mỹ cằm") ||
        textMessage.includes("don cam") || textMessage.includes("độn cằm")
      ) {
        await sendThamMyCamFlow(senderId);
        continue;
      }

      if (
        textMessage.includes("tham my vung kin") || textMessage.includes("thẩm mỹ vùng kín")
      ) {
        await sendThamMyVungKinFlow(senderId);
        continue;
      }

      if (
        textMessage.includes("treo cung may") || textMessage.includes("treo cung mày")
      ) {
        await sendTreoCungMayFlow(senderId);
        continue;
      }

      if (
        textMessage.includes("chinh mui loi") || textMessage.includes("chỉnh mũi lỗi")
      ) {
        await sendChinhMuiLoiFlow(senderId);
        continue;
      }

      if (
        textMessage.includes("thao tui nguc") || textMessage.includes("tháo túi ngực")
      ) {
        await sendThaoTuiNgucFlow(senderId);
        continue;
      }

      // 4️⃣ Xin bảng giá only
      if (textMessage.includes("bảng giá")) {
        if (textMessage.includes("nâng ngực")) {
          await sendBangGiaOnlyFlow(senderId, "nguc");
          continue;
        }

        if (textMessage.includes("nâng mũi")) {
          await sendBangGiaOnlyFlow(senderId, "mui");
          continue;
        }

        if (textMessage.includes("cắt mí")) {
          await sendBangGiaOnlyFlow(senderId, "mat");
          continue;
        }

        if (textMessage.includes("hút mỡ bụng")) {
          await sendBangGiaOnlyFlow(senderId, "bung");
          continue;
        }

        if (textMessage.includes("thẩm mỹ vùng kín")) {
          await sendBangGiaOnlyFlow(senderId, "vungkin");
          continue;
        }

        if (textMessage.includes("căng da mặt")) {
          await sendBangGiaOnlyFlow(senderId, "damat");
          continue;
        }

        if (textMessage.includes("dịch vụ khác")) {
          await sendBangGiaOnlyFlow(senderId, "cacdichvu");
          continue;
        }
      }

		// 5️⃣ Lời chào và menu dịch vụ
		const loiChaoKeywords = [
		  "hi", "hello", "alo", "xin chao",
		  "cho chi hoi", "toi can tu van", "can tu van",
		  "dich vu", "tu van dich vu"
		];

		// ✅ Sử dụng includes() → sai → đổi thành kiểm tra đúng nguyên câu!
		if (loiChaoKeywords.includes(textMessage)) {
		  await sendMenuDichVu(senderId);
		  continue;
		}

      // 6️⃣ Nếu không khớp, handoff
      await handleFollowUp(senderId, textMessage);

    } catch (error) {
      console.error(`❌ Lỗi xử lý message từ ${senderId}:`, error);
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
