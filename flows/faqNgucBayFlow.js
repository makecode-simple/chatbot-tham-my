const messengerClient = require('../services/messengerClient');

async function sendFaqNgucBayFlow(sender_psid) {
    await messengerClient.sendMessage(sender_psid, {
        text: `Sau phẫu thuật nâng ngực chị nằm viện tối đa 12 tiếng, tuy nhiên thông thường thì 6-10 tiếng là khách bác Vũ đã khoẻ đi lại nhẹ nhàng bình thường nên có thể xuất viện sớm hơn.

Sau phẫu thuật không cần uống thêm giảm đau, kháng sinh, không cần đặt ống dẫn lưu, không cần nghỉ dưỡng ạ.

Bên bác Vũ cũng hỗ trợ quay video full 100% ca mổ, sử dụng dao siêu âm mới 100%, khách hàng trực tiếp ký tên lên hộp dao trước khi mổ.

Sau 2 ngày chị có thể bay nội địa, 7 ngày bay quốc tế ạ`
    });
}

module.exports = sendFaqNgucBayFlow;