const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const WIT_AI_TOKEN = process.env.WIT_AI_TOKEN;

const headers = {
  'Authorization': `Bearer ${WIT_AI_TOKEN}`,
  'Content-Type': 'application/json'
};

// Import content từ servicesFlow.js
const serviceContents = require('./servicesFlow.js');

// Chuẩn bị dữ liệu utterances từ nội dung serviceFlow.js
let utterances = [];

const servicesMap = [
  { intent: 'hoi_dich_vu_nang_nguc', data: serviceContents.nangNgucContent, dichVu: 'Nâng ngực' },
  { intent: 'hoi_dich_vu_nang_mui', data: serviceContents.nangMuiContent, dichVu: 'Nâng mũi' },
  { intent: 'hoi_dich_vu_cat_mi', data: serviceContents.thamMyMatContent, dichVu: 'Cắt mí' },
  { intent: 'hoi_dich_vu_hut_mo_bung', data: serviceContents.hutMoBungContent, dichVu: 'Hút mỡ bụng' },
  { intent: 'hoi_dich_vu_tham_my_vung_kin', data: serviceContents.thamMyVungKinContent, dichVu: 'Thẩm mỹ vùng kín' },
  { intent: 'hoi_dich_vu_cang_da_mat', data: serviceContents.cangDaMatContent, dichVu: 'Căng da mặt' },
  { intent: 'hoi_dich_vu_tham_my_cam', data: serviceContents.thamMyCamContent, dichVu: 'Thẩm mỹ cằm' },
  { intent: 'hoi_dich_vu_thao_tui_nguc', data: serviceContents.thaoTuiNgucContent, dichVu: 'Tháo túi ngực' },
  { intent: 'hoi_dich_vu_chinh_mui_loi', data: serviceContents.chinhMuiLoiContent, dichVu: 'Chỉnh mũi lỗi' },
  { intent: 'hoi_dich_vu_tao_hinh_thanh_bung', data: serviceContents.taoHinhThanhBungContent, dichVu: 'Tạo hình thành bụng' },
  { intent: 'hoi_dich_vu_hut_mo_body', data: serviceContents.hutMoBodyContent, dichVu: 'Hút mỡ body' },
  { intent: 'hoi_dich_vu_don_thai_duong', data: serviceContents.donThaiDuongContent, dichVu: 'Độn thái dương' },
  { intent: 'hoi_dich_vu_cang_chi_da_mat', data: serviceContents.cangChiDaMatContent, dichVu: 'Căng chỉ da mặt' },
  { intent: 'hoi_dich_vu_chinh_mat_loi', data: serviceContents.chinhMatLoiContent, dichVu: 'Chỉnh mắt lỗi' }
];

// Tạo danh sách utterances
servicesMap.forEach(service => {
  service.data.forEach(text => {
    utterances.push({
      text,
      intent: service.intent,
      entities: [{ entity: "dich_vu", value: service.dichVu }]
    });
  });
});

// Hàm import dữ liệu lên Wit.ai
(async () => {
  try {
    const response = await axios.post('https://api.wit.ai/utterances?v=20230215', utterances, { headers });
    console.log('✅ Training Wit.ai thành công:', response.data);
  } catch (err) {
    console.error('❌ Lỗi khi import dữ liệu lên Wit.ai:', err.response.data);
  }
})();
