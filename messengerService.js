
const request = require("request");

// ====== IMPORT FLOWS ======
const {
    sendNangNgucFlow,
    sendNangMuiFlow,
    sendCatMiFlow,
    sendHutMoBungFlow,
    sendThamMyVungKinFlow,
    sendCangDaMatFlow,
    sendThamMyCamFlow,
    sendDichVuKhacFlow
} = require("./servicesFlow");

// ====== USER SESSION ======
let userSession = {};

// ====== GỬI TIN NHẮN VỀ FACEBOOK ======
function sendMessage(senderId, response) {
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

    const requestBody = {
        recipient: { id: senderId },
        message: response,
    };

    request({
        uri: "https://graph.facebook.com/v17.0/me/messages",
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: "POST",
        json: requestBody
    }, (err, res, body) => {
        if (err) {
            console.error("Lỗi gửi tin nhắn:", err);
        } else {
            console.log("Gửi tin nhắn thành công:", body);
        }
    });
}

// ====== XỬ LÝ TIN NHẮN NGƯỜI DÙNG ======
async function handleUserMessage(senderId, userMessage, flowData) {
    const currentService = userSession[senderId]?.service || null;
    const normalizedMessage = normalizeText(userMessage);

    // Kiểm tra câu hỏi trong FAQs
    const faq = flowData.faqs.find(item => item.questions.includes(normalizedMessage));

    if (faq) {
        await sendMessage(senderId, { text: faq.answer });
        return;
    }

    // Nếu khách muốn xem danh sách dịch vụ
    if (userMessage.toLowerCase().includes('dịch vụ') || userMessage.toLowerCase().includes('tư vấn')) {
        await sendMessage(senderId, {
            text: `Dạ chào chị, chị muốn tư vấn dịch vụ thẩm mỹ tạo hình nào dưới đây ạ:

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

* Hút mỡ tiêm lên mặt`
        });
        return;
    }

    // Nếu đã có dịch vụ đang tư vấn, điều hướng flow chi tiết
    if (currentService) {
        if (currentService === "Nâng mũi") {
            await sendNangMuiFlow(senderId);
        } else if (currentService === "Nâng ngực") {
            await sendNangNgucFlow(senderId);
        } else if (currentService === "Cắt mí") {
            await sendCatMiFlow(senderId);
        } else if (currentService === "Hút mỡ bụng") {
            await sendHutMoBungFlow(senderId);
        } else if (currentService === "Thẩm mỹ vùng kín") {
            await sendThamMyVungKinFlow(senderId);
        } else if (currentService === "Căng da mặt") {
            await sendCangDaMatFlow(senderId);
        } else if (currentService === "Thẩm mỹ cằm") {
            await sendThamMyCamFlow(senderId);
        } else if (currentService === "Dịch vụ khác") {
            await sendDichVuKhacFlow(senderId);
        } else {
            await sendMessage(senderId, { text: "Dạ chị vui lòng để lại số điện thoại để bên em hỗ trợ chi tiết hơn ạ!" });
        }
        return;
    }

    // Mặc định khi không nhận diện được ý định
    await sendMessage(senderId, { text: "Dạ chị vui lòng để lại số điện thoại để bên em hỗ trợ chi tiết hơn ạ!" });
}

// ====== HÀM XỬ LÝ CHUẨN HÓA VĂN BẢN ======
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim();
}

module.exports = {
    sendMessage,
    handleUserMessage
};
