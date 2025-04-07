const natural = require('natural');
const fs = require('fs');

const classifier = new natural.BayesClassifier();

// Training data
const trainingData = {
    "menu_dich_vu": [
        "xem các dịch vụ",
        "menu dịch vụ",
        "các dịch vụ khác",
        "dịch vụ làm đẹp",
        "dv làm đẹp",
        "dịch vụ thẩm mỹ",
        "tư vấn dịch vụ",
        "có những dịch vụ nào",
        "danh sách dịch vụ",
        "dịch vụ gì",
        "thẩm mỹ gì",
        "làm đẹp gì",
        "menu",
        "dịch vụ",
        "tư vấn làm đẹp",
        "muốn làm đẹp",
        "dv thẩm mỹ",
        "dv khác",
        "các dv",
        "tất cả dịch vụ"
    ],
    "nang_nguc": [
        "tư vấn nâng ngực",
        "nâng ngực giá bao nhiêu",
        "phẫu thuật ngực có đau không",
        "muốn nâng ngực",
        "chi phí đặt túi ngực",
        "nâng ngực ở đâu tốt",
        "nâng ngực có để lại sẹo không",
        "nâng ngực bao lâu thì lành",
        "tháo túi ngực cũ",
        "thay túi ngực"
    ],
    "nang_mui": [
        "nâng mũi hết bao nhiêu",
        "tư vấn nâng mũi",
        "phẫu thuật mũi",
        "muốn sửa mũi",
        "nâng mũi sụn sườn",
        "nâng mũi có đau không",
        "chỉnh sửa mũi hỏng",
        "mũi bị lệch",
        "mũi bị biến chứng",
        "sửa mũi hỏng"
    ],
    "tham_my_mat": [
        "cắt mí mắt",
        "nhấn mí",
        "bấm mí",
        "tư vấn về mắt",
        "phẫu thuật mắt",
        "mắt bị xệ",
        "mắt một mí",
        "mắt không đều",
        "treo cung mày",
        "chỉnh sửa mắt"
    ],
    "tham_my_cam": [
        "độn cằm",
        "gọt cằm",
        "cằm ngắn",
        "cằm lệch",
        "chỉnh cằm",
        "làm cằm vline"
    ],
    "cang_da": [
        "căng da mặt",
        "trẻ hóa da",
        "căng chỉ",
        "căng da chảy xệ",
        "xóa nhăn",
        "làm căng da mặt"
    ],
    "hoi_gia": [
        "giá bao nhiêu",
        "chi phí",
        "bảng giá",
        "phí phẫu thuật",
        "giá cả thế nào"
    ],
    "dat_lich": [
        "đặt lịch",
        "hẹn khám",
        "đăng ký tư vấn",
        "muốn gặp bác sĩ",
        "lịch khám",
        "cho em xin số điện thoại",
        "xin số zalo",
        "xin số viber",
        "muốn tư vấn",
        "tư vấn trực tiếp",
        "gặp trực tiếp",
        "muốn đến khám",
        "đặt hẹn",
        "xin số điện thoại tư vấn",
        "muốn được tư vấn",
        "cần tư vấn",
        "tư vấn giúp em",
        "cho em đặt lịch",
        "muốn book lịch",
        "book lịch khám",
        "đặt lịch",
        "đặt hẹn",
        "đặt lịch khám",
        "đặt lịch tư vấn",
        "xin số điện thoại",
        "cho xin số điện thoại",
        "số điện thoại của chị là",
        "số điện thoại của em là",
        "số của chị là",
        "số của em là",
        "số điện thoại:",
        "sđt:",
        "sdt:",
        "số điện thoại",
        "đây là số của chị",
        "đây là số của em",
        "số zalo của chị là",
        "số zalo của em là",
        "zalo của chị",
        "zalo của em",
        "viber của chị là",
        "viber của em là"
    ],
    "dia_chi": [
        "phòng khám ở đâu",
        "địa chỉ phòng khám",
        "chỗ khám ở đâu",
        "địa điểm phòng khám",
        "văn phòng ở đâu",
        "địa chỉ bác sĩ",
        "phòng khám nằm ở đâu",
        "tìm đường đến phòng khám",
        "chỉ đường đến phòng khám"
    ],
    
    "hut_mo": [
        "hút mỡ bụng",
        "giảm mỡ bụng",
        "hút mỡ đùi",
        "hút mỡ toàn thân",
        "giảm béo không phẫu thuật",
        "hút mỡ body",
        "hút mỡ bắp tay",
        "giảm mỡ nhanh",
        "hút mỡ có đau không"
    ],

    "tham_my_vung_kin": [
        "thu hẹp vùng kín",
        "tư vấn thẩm mỹ vùng kín",
        "phẫu thuật vùng kín",
        "làm hồng vùng kín",
        "tạo hình vùng kín"
    ],

    "xem_feedback": [
        "xem kết quả",
        "hình ảnh trước sau",
        "khách hàng đã làm",
        "review kết quả",
        "feedback khách hàng",
        "before after",
        "kết quả thẩm mỹ",
        "hình ảnh thực tế"
    ]
};

// Normalize text function
function normalizeText(text) {
    return text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[!.,?]/g, "");
}

// Add documents to classifier with normalized text
Object.keys(trainingData).forEach(intent => {
    trainingData[intent].forEach(text => {
        classifier.addDocument(normalizeText(text), intent);
    });
});

classifier.addDocument('bị biến chứng', 'bien_chung');
classifier.addDocument('bị hỏng', 'bien_chung');
classifier.addDocument('bị lỗi', 'bien_chung');
classifier.addDocument('bị hư', 'bien_chung');
classifier.addDocument('bị hỏng mũi', 'bien_chung');
classifier.addDocument('bị hỏng ngực', 'bien_chung');
classifier.addDocument('bị biến dạng', 'bien_chung');
classifier.addDocument('sửa lại', 'bien_chung');
classifier.addDocument('phẫu thuật lại', 'bien_chung');
classifier.addDocument('chỉnh sửa lại', 'bien_chung');
classifier.addDocument('khắc phục', 'bien_chung');
classifier.addDocument('giải cứu', 'bien_chung');
classifier.addDocument('treo sa trễ', 'treo_sa_tre');
classifier.addDocument('ngực sa trễ', 'treo_sa_tre');
classifier.addDocument('ngực chảy xệ', 'treo_sa_tre');
classifier.addDocument('nâng ngực sa trễ', 'treo_sa_tre');
classifier.addDocument('phẫu thuật treo ngực', 'treo_sa_tre');
classifier.addDocument('khắc phục ngực sa', 'treo_sa_tre');
classifier.addDocument('khắc phục ngực trễ', 'treo_sa_tre');
classifier.addDocument('chỉnh sửa lại', 'bien_chung');
classifier.addDocument('khắc phục', 'bien_chung');
classifier.addDocument('giải cứu', 'bien_chung');
// Add FAQ intents
classifier.addDocument('tháo túi ngực', 'faq_thao_tui');
classifier.addDocument('tháo túi không đau', 'faq_thao_tui');
classifier.addDocument('nâng ngực dao siêu âm', 'faq_nang_nguc_dao');
classifier.addDocument('nâng ngực không đau', 'faq_nang_nguc_dao');
classifier.addDocument('bay sau nâng ngực', 'faq_nguc_bay');
classifier.addDocument('đi máy bay sau nâng ngực', 'faq_nguc_bay');
classifier.addDocument('xuất viện sau nâng ngực', 'faq_nguc_bay');
classifier.addDocument('chỉnh sửa lại', 'bien_chung');
classifier.addDocument('khắc phục', 'bien_chung');
classifier.addDocument('giải cứu', 'bien_chung');
// Train the classifier
classifier.train();

// Save the trained model
classifier.save('model.json', (err) => {
    if (err) {
        console.error('Error saving model:', err);
    } else {
        console.log('✅ Model trained and saved successfully!');
        
        // Test some examples
        console.log('\nTesting some examples:');
        [
            "em muốn nâng ngực",
            "cho em hỏi về nâng mũi",
            "bác sĩ tư vấn cắt mí giúp em",
            "chi phí phẫu thuật là bao nhiêu",
            "em muốn đặt lịch khám"
        ].forEach(text => {
            console.log(`Input: "${text}"`);
            console.log(`Predicted intent: ${classifier.classify(normalizeText(text))}\n`);
        });
    }
});