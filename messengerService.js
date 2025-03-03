const request = require("request");

// Gửi tin nhắn văn bản
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
        json: requestBody,
    }, (err, res, body) => {
        if (err) {
            console.error("Lỗi gửi tin nhắn:", err);
        } else {
            console.log("Gửi tin nhắn thành công:", body);
        }
    });
}

// Hỏi ChatGPT khi không có trong kịch bản
async function getChatGPTResponse(userMessage) {
    return "Xin lỗi, em chưa có câu trả lời chính xác cho câu hỏi của chị. Chị có thể hỏi lại giúp em nhé! 😊";
}

module.exports = { sendMessage, getChatGPTResponse };
