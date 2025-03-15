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

// ====== FLOW FUNCTIONS ======

// ====== FLOW: MENU DỊCH VỤ ======
async function sendMenuDichVu(sender_psid) {
  console.log("🚀 Trigger Menu dịch vụ");
  const menuText = `Dạ chào chị, chị muốn tư vấn dịch vụ thẩm mỹ tạo hình nào dưới đây ạ:

* Phẫu thuật nâng ngực/ tháo túi ngực/ bóc bao xơ
* Tái tạo vú sau khi điều trị ung thư
* Hút mỡ bụng, tạo hình thành bụng sau sinh
* Tiểu phẫu cắt mí
* Tiểu phẫu treo cung mày
* Chỉnh mắt lỗi
* Nâng mũi tái cấu trúc/ nâng mũi sụn sườn
* Chỉnh mũi lỗi
* Phẫu thuật căng da mặt
* Hút mỡ bụng/tay/ đùi/ lưng
* Thẩm mỹ vùng kín
* Căng da mặt toàn diện
* Căng chỉ da mặt/ PRP trẻ hóa
* Độn thái dương/ độn cằm
* Hút mỡ tiêm lên mặt`;

await messengerService.sendMessage(sender_psid, { text: menuText });
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
// ====== FLOW: HÚT MỠ BỤNG ======
async function sendHutMoBungFlow(sender_psid) {
  console.log("🚀 Trigger Hút Mỡ Bụng Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Dạ em gửi chị thông tin về dịch vụ hút mỡ bụng bên bác Vũ nha!\n
Không đau - Không cần nghỉ dưỡng - Về ngay trong ngày.`
  });

  const feedbackImages = await getFeedbackImages("bung");

  for (const url of feedbackImages) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url, is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const bangGiaImage = await getBangGiaImage("banggia_hutmobung");

  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để em tư vấn chi tiết hơn cho mình nha!"
  });
}
// ====== FLOW: CĂNG DA MẶT ======
async function sendCangDaMatFlow(sender_psid) {
  console.log("🚀 Trigger Căng Da Mặt Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Dạ bên bác Vũ thực hiện căng da mặt toàn diện không đau, hồi phục nhanh, không để lại sẹo chị nha!`
  });

  const feedbackImages = await getFeedbackImages("damat");

  for (const url of feedbackImages) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url, is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const bangGiaImage = await getBangGiaImage("banggia_cangdamat");

  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để em tư vấn chi tiết hơn cho mình nha!"
  });
}
// ====== FLOW: PHẪU THUẬT KHÁC ======
async function sendPhauThuatKhacFlow(sender_psid) {
  console.log("🚀 Trigger Phẫu Thuật Khác Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Dạ chị ơi, em gửi các dịch vụ phẫu thuật khác bên bác Vũ để mình tham khảo ạ!`
  });

  const bangGiaImage = await getBangGiaImage("banggia_cacdichvukhac");

  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để em tư vấn chi tiết hơn cho mình nha!"
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

// ====== FLOW: XIN SỐ ĐIỆN THOẠI ======
async function sendXinSoDienThoai(sender_psid) {
  console.log("🚀 Xin số điện thoại khách");

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
// Flow: Tái tạo vú sau ung thư
async function sendTaiTaoVuFlow(sender_psid) {
  console.log("🚀 Trigger Tái Tạo Vú Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Dạ chị ơi, bên em chuyên thực hiện tái tạo vú sau điều trị ung thư với kỹ thuật tiên tiến nhất, giúp phục hồi dáng vú tự nhiên, an toàn và không đau ạ!`
  });

  const feedbackImages = await getFeedbackImages("taotaovu");

  for (const url of feedbackImages) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url, is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

// Flow: Chỉnh mắt lỗi
async function sendChinhMatLoiFlow(sender_psid) {
  console.log("🚀 Trigger Chỉnh Mắt Lỗi Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Dạ bên bác Vũ chuyên sửa các ca mắt lỗi như mí hỏng, mí không đều, sụp mí... đảm bảo không đau, hồi phục nhanh và tự nhiên nhất ạ!`
  });

  const feedbackImages = await getFeedbackImages("mat");

  for (const url of feedbackImages) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url, is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để em tư vấn chi tiết hơn cho mình nha!"
  });
}

// Flow: Căng chỉ da mặt/ PRP trẻ hóa
async function sendCangChiDaMatFlow(sender_psid) {
  console.log("🚀 Trigger Căng Chỉ Da Mặt Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Dạ bên bác Vũ sử dụng công nghệ căng chỉ collagen và PRP trẻ hóa không đau, không sưng bầm, giúp da săn chắc trẻ trung ngay ạ!`
  });

  const feedbackImages = await getFeedbackImages("cangchi");

  for (const url of feedbackImages) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url, is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để em tư vấn chi tiết hơn cho mình nha!"
  });
}

// Flow: Độn thái dương
async function sendDonThaiDuongFlow(sender_psid) {
  console.log("🚀 Trigger Độn Thái Dương Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Dạ bên bác Vũ độn thái dương sử dụng vật liệu an toàn, tự nhiên, hồi phục nhanh và không để lại dấu vết chị nha!`
  });

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để em tư vấn chi tiết hơn cho mình nha!"
  });
}

// Flow: Hút mỡ tay, đùi, lưng
async function sendHutMoBodyFlow(sender_psid) {
  console.log("🚀 Trigger Hút Mỡ Body Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Dạ bên bác Vũ chuyên hút mỡ tay, đùi, lưng không đau, hồi phục nhanh, hiệu quả rõ rệt chị nha!`
  });

  const feedbackImages = await getFeedbackImages("body");

  for (const url of feedbackImages) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url, is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

// Flow: Hút mỡ tiêm lên mặt
async function sendHutMoTiemLenMatFlow(sender_psid) {
  console.log("🚀 Trigger Hút Mỡ Tiêm Lên Mặt Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Dạ bên bác Vũ hút mỡ tự thân và tiêm lên mặt giúp khuôn mặt trẻ trung, đầy đặn tự nhiên, không đau, không nghỉ dưỡng ạ!`
  });

  await messengerService.sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

// ====== FOLLOW UP QUESTION HANDLER ======
async function handleFollowUp(sender_psid, textMessage) {
  if (!flowFullServices || !flowFullServices.faqs) {
    console.log("❌ FAQs bị null hoặc không load được");
    return;
  }

  console.log("🔍 User hỏi gì:", textMessage);

  const found = flowFullServices.faqs.find(item =>
    item.questions.some(q => textMessage.includes(q))
  );

  if (found) {
    console.log("✅ Trả lời câu hỏi:", found.answer);
    await messengerService.sendMessage(sender_psid, { text: found.answer });
  } else {
    console.log(`🚀 Handoff triggered for ${sender_psid}`);
    handoffUsers.add(sender_psid);
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

      // 2️⃣ Kiểm tra FAQ trước
      const foundFaq = flowFullServices.faqs.find(item =>
        item.questions.some(q => textMessage.includes(q))
      );
      if (foundFaq) {
        await messengerService.sendMessage(sender_psid, { text: foundFaq.answer });
        continue;
      }

      // 3️⃣ Các flow dịch vụ
      const serviceKeywords = [
        { keywords: ["nang nguc", "nâng ngực", "dat tui nguc", "đặt túi ngực", "don nguc", "độn ngực"], action: sendNangNgucFlow },
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

      // 4️⃣ Xin bảng giá only
      if (textMessage.includes("bảng giá")) {
        await sendBangGiaOnlyFlow(sender_psid, "cacdichvu");
        continue;
      }

      // 5️⃣ Lời chào và menu dịch vụ
      const loiChaoKeywords = ["hi", "hello", "alo", "xin chao", "toi can tu van", "can tu van", "dich vu", "tu van dich vu"];

      if (loiChaoKeywords.some(keyword => textMessage === keyword)) {
        await sendMenuDichVu(sender_psid);
        continue;
      }

      // 6️⃣ Default handoff
      console.log(`🚀 Handoff triggered for ${sender_psid}`);
      handoffUsers.add(sender_psid);

    } catch (error) {
      console.error(`❌ Lỗi xử lý message từ ${sender_psid}:`, error);
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
