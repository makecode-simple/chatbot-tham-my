const express = require("express");
const bodyParser = require("body-parser");
const { getImages } = require("./cloudinaryService");
const { sendMessage, getChatGPTResponse } = require("./messengerService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// 🎯 Kịch bản phản hồi
const scripts = {
    "nangnguc": {
        text: `Dạ chào chị, xin phép em giới thiệu về phương pháp phẫu thuật **NÂNG NGỰC KHÔNG ĐAU** bằng dao mổ siêu âm Ultrasonic Surgical Scalpel chị xem qua ạ.\n\n
        🔹 Dao Ultrasonic Surgical Scalpel giúp bác sĩ tạo khoang ngực không chảy máu, giảm đau sau phẫu thuật đến 90%.\n
        🔹 Thời gian nghỉ dưỡng rất ít, chỉ sau **6-12H** chị có thể sinh hoạt bình thường.\n
        🔹 **Không đau - Không chảy máu - Không tiết dịch - Không để lại sẹo**.\n
        ✅ Em gửi chị ảnh feedback của khách hàng nhé!`,
        images: "nangnguc"
    },
    "hutmo": {
        text: `Dạ chị ơi, đây là thông tin về **HÚT MỠ KHÔNG ĐAU** ạ! 💪\n\n
        🔹 Công nghệ **Body Jet** hiện đại, hạn chế xâm lấn, **không gây đau, không để lại sẹo**.\n
        🔹 Chỉ cần **1 lần duy nhất**, loại bỏ mỡ thừa hiệu quả, không tái phát.\n
        🔹 Chị có thể đi lại bình thường sau **6-8 giờ** mà không cần nghỉ dưỡng.\n
        ✅ Em gửi chị ảnh feedback khách hàng nhé!`,
        images: "hutmo"
    }
};

// 🔥 Xử lý tin nhắn khách gửi đến
async function handleMessage(senderId, userMessage) {
    let response = { text: "Dạ chị ơi, em chưa hiểu câu hỏi của chị. Chị có thể hỏi lại giúp em nha! 😊" };
    let service = "";

    // Xác định dịch vụ khách quan tâm
    if (userMessage.includes("nâng ngực")) {
        service = "nangnguc";
    } else if (userMessage.includes("hút mỡ")) {
        service = "hutmo";
    }

    // Nếu có dịch vụ hợp lệ
    if (service && scripts[service]) {
        response.text = scripts[service].text;
        await sendMessage(senderId, response);

        // 🖼️ Lấy ảnh feedback từ Cloudinary
        const images = await getImages(scripts[service].images);

        if (images.length > 1) {
            // Gửi album ảnh
            let elements = images.map(imgUrl => ({
                media_type: "image",
                url: imgUrl
            }));

            await sendMessage(senderId, {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "media",
                        elements: elements
                    }
                }
            });
        } else if (images.length === 1) {
            // Nếu chỉ có một ảnh thì gửi bình thường
            await sendMessage(senderId, {
                attachment: { type: "image", payload: { url: images[0] } }
            });
        }
    } else {
        // 💡 Debug phản hồi từ ChatGPT
        let chatgptResponse = await getChatGPTResponse(userMessage);
        console.log("ChatGPT Response:", chatgptResponse);

        // Gửi câu trả lời từ ChatGPT
        if (chatgptResponse) {
            await sendMessage(senderId, `Dạ chị ơi, đây là thông tin em tìm được:\n\n${chatgptResponse}`);
        } else {
            await sendMessage(senderId, "Dạ chị ơi, em chưa có thông tin chính xác về câu hỏi này. Chị có thể hỏi lại giúp em nha! 😊");
        }
    }
}

// 🎯 Webhook xử lý tin nhắn từ Messenger
app.post("/webhook", async (req, res) => {
    let body = req.body;

    if (body.object === "page") {
        body.entry.forEach(async function(entry) {
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;

            if (webhook_event.message && webhook_event.message.text) {
                await handleMessage(sender_psid, webhook_event.message.text.toLowerCase());
            }
        });
        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Chatbot đang chạy trên cổng ${PORT}`);
});
