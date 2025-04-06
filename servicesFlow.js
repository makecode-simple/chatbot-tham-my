const messengerService = require('./messengerService');
const { getFeedbackImages, getBangGiaImage } = require('./cloudinaryService');

async function sendNangNgucFlow(sender_psid) {
  console.log("🚀 Trigger Nâng Ngực Flow");

  await sendMessage(sender_psid, {
    text: `Dạ bên em có dịch vụ Nâng ngực với nhiều phương pháp phù hợp. Bác sĩ sẽ tư vấn giải pháp tốt nhất cho chị nhé!`
  });

  const feedbackImages = await getFeedbackImages("nguc");

  for (const url of feedbackImages) {
    await sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url, is_reusable: true } }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const bangGiaImage = await getBangGiaImage("banggia_nangnguc");

  if (bangGiaImage) {
    await sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }

  await sendMessage(sender_psid, {
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn nha!"
  });
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
// ====== FLOW: TẠO HÌNH THÀNH BỤNG SAU SINH ======
async function sendTaoHinhThanhBungFlow(sender_psid) {
  console.log("🚀 Trigger Tạo Hình Thành Bụng Flow");

  await messengerService.sendMessage(sender_psid, {
    text: `Dạ bên bác Vũ chuyên tạo hình thành bụng sau sinh, áp dụng công nghệ hút mỡ hiện đại và căng da, đảm bảo an toàn, không đau, hồi phục nhanh và mang lại dáng bụng thon gọn tự nhiên chị nhé!`
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
    text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
  });
}

async function sendDiaChiFlow(sender_psid) {
  console.log("🚀 Trigger Địa Chỉ Flow");
  await messengerService.sendMessage(sender_psid, {
    text: `Dạ chị, địa chỉ phòng khám của bác Vũ ạ:\n\n🏥 Phòng khám Thẩm mỹ Bác sĩ Hồ Cao Vũ\n📍 Số 12 Đường số 12, P.Bình An, TP.Thủ Đức (Q2 cũ)\n☎️ Hotline: 0909.444.222`
  });
}

async function sendMenuDichVu(sender_psid) {
  console.log("🚀 Trigger Menu Dịch Vụ");
  await messengerService.sendMessage(sender_psid, {
    text: "Dạ chị, em gửi chị các dịch vụ của bác Vũ ạ:\n\n1. Nâng Ngực\n2. Nâng Mũi\n3. Thẩm Mỹ Mắt\n4. Thẩm Mỹ Cằm\n5. Hút Mỡ\n6. Căng Da Mặt\n7. Thẩm Mỹ Vùng Kín\n\nChị quan tâm dịch vụ nào ạ?"
  });
}

async function sendBangGiaOnlyFlow(sender_psid, type) {
  console.log("🚀 Trigger Bảng Giá Flow:", type);
  const bangGiaImage = await getBangGiaImage(`banggia_${type}`);
  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }
}

async function sendMenuBangGia(sender_psid) {
  console.log("🚀 Trigger Menu Bảng Giá");
  const bangGiaImage = await getBangGiaImage("banggia_cacdichvu");
  if (bangGiaImage) {
    await messengerService.sendMessage(sender_psid, {
      attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
    });
  }
}

// Export all functions
module.exports = {
  sendNangNgucFlow: require('./flows/nangNgucFlow'),
  sendThaoTuiNgucFlow: require('./flows/thaoTuiNgucFlow'),
  sendNangMuiFlow: require('./flows/nangMuiFlow'),
  sendThamMyMatFlow: require('./flows/thamMyMatFlow'),
  sendHutMoBungFlow: require('./flows/hutMoBungFlow'),
  sendThamMyVungKinFlow: require('./flows/thamMyVungKinFlow'),
  sendCangDaMatFlow: require('./flows/cangDaMatFlow'),
  sendThamMyCamFlow: require('./flows/thamMyCamFlow'),
  sendTreoCungMayFlow: require('./flows/treoCungMayFlow'),
  sendTaiTaoVuFlow: require('./flows/taiTaoVuFlow'),
  sendTaoHinhThanhBungFlow: require('./flows/taoHinhThanhBungFlow'),
  sendChinhMatLoiFlow: require('./flows/chinhMatLoiFlow'),
  sendChinhMuiLoiFlow: require('./flows/chinhMuiLoiFlow'),
  sendHutMoBodyFlow: require('./flows/hutMoBodyFlow'),
  sendCangChiDaMatFlow: require('./flows/cangChiDaMatFlow'),
  sendDonThaiDuongFlow: require('./flows/donThaiDuongFlow'),
  sendHutMoTiemLenMatFlow: require('./flows/hutMoTiemLenMatFlow'),
  sendDiaChiFlow,
  sendMenuDichVu,
  sendBangGiaOnlyFlow,
  sendMenuBangGia
};