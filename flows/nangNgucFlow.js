const messengerClient = require('../services/messengerClient');
const { getFeedbackImages, getBangGiaImage } = require('../cloudinaryService');

let isProcessing = new Map();

async function sendNangNgucFlow(sender_psid) {
    if (isProcessing.get(sender_psid)) {
        return;
    }
    
    try {
        isProcessing.set(sender_psid, true);
        console.log("🚀 Trigger Nâng Ngực Flow");
        
        await messengerClient.sendMessage(sender_psid, {
            text: `Dạ chào chị, xin phép chị cho em giới thiệu về phương pháp phẫu thuật NÂNG NGỰC KHÔNG ĐAU bằng dao mổ siêu âm Ultrasonic Surgical Scalpel chị xem qua ạ.

* Dao Ultrasonic Surgical Scalpel là dao siêu âm. Có ưu điểm ĐỐT - HÀN - CẮT vì thế bác sĩ tạo khoang ngực đặt túi không chảy máu, không chảy dịch, giảm đau sau phẫu thuật đến 90%, lành thương nhanh, không gây ra các biến chứng và biến chứng muộn.

* Thời gian nghỉ dưỡng rất ít, chỉ sau 6-12H phẫu thuật chị có thể sinh hoạt, đi làm bình thường, không cần nghỉ dưỡng.
* Sau phẫu thuật KHÔNG ĐẶT ỐNG DẪN LƯU, KHÔNG DÙNG THÊM THUỐC GIẢM ĐAU HAY KHÁNG SINH.

* Phương pháp sử dụng dao Ultrasonic Surgical Scalpel đạt được 6 tiêu chí
1. Không đau
2. Không gây chảy máu
3. Không tiết dịch
4. Không gây co thắt bao xơ
5. Không cần nghỉ dưỡng
6. Không để lại sẹo`
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        const feedbackImages = await getFeedbackImages("nguc");
        const maxImages = 7;
        
        for (let i = 0; i < Math.min(feedbackImages.length, maxImages); i++) {
            await messengerClient.sendMessage(sender_psid, {
                attachment: { type: 'image', payload: { url: feedbackImages[i], is_reusable: true } }
            });
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        const bangGiaImage = await getBangGiaImage("banggia_nangnguc");
        if (bangGiaImage) {
            await messengerClient.sendMessage(sender_psid, {
                attachment: { type: 'image', payload: { url: bangGiaImage, is_reusable: true } }
            });
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        await messengerClient.sendMessage(sender_psid, {
            text: "Chị để lại số điện thoại/Zalo/Viber để bên em tư vấn chi tiết hơn cho mình nha!"
        });

    } catch (error) {
        console.error('❌ Error in nangNgucFlow:', error);
    } finally {
        isProcessing.delete(sender_psid);
    }
}

module.exports = sendNangNgucFlow;