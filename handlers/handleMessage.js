const sendTreoSaTreFlow = require('../flows/treoSaTreFlow');
const serviceFlows = require('../servicesFlow');

async function handleMessage(sender_psid, received_message) {
  // ... existing code ...
  
  switch(intent) {
    case 'menu_dich_vu':
      await serviceFlows.sendMenuDichVu(sender_psid);
      break;
      
    case 'nang_nguc':
      await serviceFlows.sendNangNgucFlow(sender_psid);
      break;
      
    case 'nang_mui':
      await serviceFlows.sendNangMuiFlow(sender_psid);
      break;
      
    case 'tham_my_mat':
      await serviceFlows.sendThamMyMatFlow(sender_psid);
      break;
      
    case 'tham_my_cam':
      await serviceFlows.sendThamMyCamFlow(sender_psid);
      break;
      
    case 'cang_da':
      await serviceFlows.sendCangDaMatFlow(sender_psid);
      break;
      
    case 'hut_mo':
      await serviceFlows.sendHutMoBungFlow(sender_psid);
      break;
      
    case 'tham_my_vung_kin':
      await serviceFlows.sendThamMyVungKinFlow(sender_psid);
      break;
      
    case 'treo_sa_tre':
      await serviceFlows.sendTreoSaTreFlow(sender_psid);
      break;
      
    case 'dia_chi':
      await serviceFlows.sendDiaChiFlow(sender_psid);
      break;
      
    case 'xem_feedback':
      await serviceFlows.sendFeedbackFlow(sender_psid);
      break;
      
    case 'bien_chung':
      await serviceFlows.sendBienChungFlow(sender_psid);
      break;
      
    // Add FAQ handlers
    case 'faq_thao_tui':
      await serviceFlows.sendThaoTuiFaq(sender_psid);
      break;
      
    case 'faq_nang_nguc_dao':
      await serviceFlows.sendFaqNangNgucDaoFlow(sender_psid);
      break;
      
    case 'faq_nguc_bay':
      await serviceFlows.sendFaqNgucBayFlow(sender_psid);
      break;
      
    case 'faq_size_tui':
      await serviceFlows.sendFaqSizeTuiFlow(sender_psid);
      break;
      
    // Add additional service handlers
    case 'treo_cung_may':
      await serviceFlows.sendTreoCungMayFlow(sender_psid);
      break;
      
    case 'tai_tao_vu':
      await serviceFlows.sendTaiTaoVuFlow(sender_psid);
      break;
      
    case 'tao_hinh_thanh_bung':
      await serviceFlows.sendTaoHinhThanhBungFlow(sender_psid);
      break;
      
    case 'chinh_mat_loi':
      await serviceFlows.sendChinhMatLoiFlow(sender_psid);
      break;
      
    case 'chinh_mui_loi':
      await serviceFlows.sendChinhMuiLoiFlow(sender_psid);
      break;
      
    case 'hut_mo_body':
      await serviceFlows.sendHutMoBodyFlow(sender_psid);
      break;
      
    case 'cang_chi_da_mat':
      await serviceFlows.sendCangChiDaMatFlow(sender_psid);
      break;
      
    case 'don_thai_duong':
      await serviceFlows.sendDonThaiDuongFlow(sender_psid);
      break;
      
    case 'hut_mo_tiem_len_mat':
      await serviceFlows.sendHutMoTiemLenMatFlow(sender_psid);
      break;

    // Default case
    default:
      await serviceFlows.sendMenuDichVu(sender_psid);
      break;
  }
}

module.exports = handleMessage;