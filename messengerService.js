// ====== IMPORTS ======
const request = require("request");
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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

// ====== USER SESSION (Để giữ context dịch vụ khách đang hỏi) ======
let userSession = {};

// ====== SEND MESSAGE ======
function sendMessage(senderId, response) {
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

    const requestBody = {
        recipient: { id: senderId },
        message: response,
    };

    request(
        {
            uri: "https://graph.facebook.com/v17.0/me/messages",
            qs: { access_token: PAGE_ACCESS_TOKEN },
            method: "POST",
            json: requestBody,
        },
        (err, res, body) => {
            if (err) {
                console.error("Lỗi gửi tin nhắn:", err);
            } else {
                console.log("Gửi tin nhắn thành công:", body);
            }
        }
    );
}

// ====== XỬ LÝ TIN NHẮN NGƯỜI DÙNG ======
async function handleUserMessage(senderId, userMessage, flowData) {
    const currentService = userSession[senderId]?.service || null;
    const normalizedMessage = normalizeText(userMessage);

    // 1. Tìm trong FAQs
    const faq = flowData.faqs.find(item =>
        item.questions.includes(normalizedMessage)
    );

    if (faq) {
        await sendMessage(senderId, { text: faq.answer });
        return;
    }

    // 2. GPT hỗ trợ đoán ý
    const gptResponse = await getChatGPTResponse(userMessage, currentService, flowData);

    const { intent, reply, newService } = gptResponse;

    if (newService) {
        userSession[senderId] = { service: newService };
    }

    if (intent === "show_services") {
        await sendMessage(senderId, {
            text: `Dạ chào chị, chị muốn tư vấn dịch vụ thẩm mỹ tạo hình nào dưới đây ạ:\n
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
* Hút mỡ tiêm lên mặt`
        });
    } else if (intent === "service_detail") {
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
            await sendMessage(senderId, { text: reply });
        }
    } else {
        await sendMessage(senderId, { text: reply });
    }
}

// ====== GPT XỬ LÝ ĐOÁN Ý ======
async function getChatGPTResponse(userMessage, currentService, flowData) {
    const availableServices = flowData.flows
        .flatMap(f => f.sub_flows.map(sf => sf.sub_service))
        .join(", ");

const prompt = `
Bạn là một hệ thống điều hướng kịch bản tư vấn thẩm mỹ cho Dr. Học Cao Vũ.

QUY ĐỊNH BẮT BUỘC:
- KHÔNG được tự trả lời câu hỏi của khách hàng.
- KHÔNG được viết câu trả lời tư vấn, mô tả dịch vụ hay bất kỳ nội dung nào không có trong flow.
- CHỈ được phân loại intent và trả về dịch vụ khách quan tâm.
- NẾU khách hỏi dịch vụ hoặc muốn xem danh sách dịch vụ => intent: show_services.
- NẾU khách hỏi chi tiết dịch vụ đang tư vấn => intent: service_detail.
- NẾU không hiểu khách hỏi gì => intent: unknown.

ĐẦU VÀO:
- Danh sách dịch vụ: ${availableServices}.
- Dịch vụ hiện tại khách đang tư vấn: ${currentService || "Chưa có"}.
- Câu hỏi khách hàng: "${userMessage}"

KẾT QUẢ JSON PHẢI TRẢ VỀ (CHỈ JSON):
{
  "intent": "show_services" | "service_detail" | "unknown",
  "reply": "Đã trigger flow dịch vụ [Tên dịch vụ] hoặc trả lời điều hướng đơn giản",
  "newService": "Tên dịch vụ hoặc null"
}
`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "Bạn là trợ lý tư vấn thân thiện nhưng chính xác, không bịa thông tin."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.3,
        });

        const rawResponse = completion.choices[0].message.content;
        console.log("Raw GPT response:", rawResponse);

        const parsed = JSON.parse(rawResponse);

        return {
            intent: parsed.intent,
            reply: parsed.reply,
            newService: parsed.newService || null
        };
    } catch (err) {
        console.error("Lỗi GPT:", err);
        return {
            intent: "unknown",
            reply: "Dạ, chị vui lòng để lại số điện thoại để bên em hỗ trợ chi tiết hơn ạ!",
            newService: null
        };
    }
}

// ====== NORMALIZE TEXT (Loại bỏ dấu, viết thường...) ======
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
