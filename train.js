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

// Remove conflicting data from nang_mui
const nangMuiData = trainingData.nang_mui.filter(text => 
  !text.includes('biến chứng') && !text.includes('hỏng')
);
trainingData.nang_mui = nangMuiData;

// Add weighted training data
// Biến chứng with high weight
classifier.addDocument(normalizeText('biến chứng'), 'bien_chung', 10);
classifier.addDocument(normalizeText('bị biến chứng'), 'bien_chung', 10);
classifier.addDocument(normalizeText('có biến chứng'), 'bien_chung', 10);

// Clear previous nang_mui training data
trainingData.nang_mui = [
    "nâng mũi hết bao nhiêu",
    "tư vấn nâng mũi",
    "phẫu thuật mũi",
    "muốn sửa mũi",
    "nâng mũi sụn sườn",
    "nâng mũi có đau không",
    "cho em hỏi về nâng mũi",
    "muốn nâng mũi",
    "tư vấn về mũi",
    "phẫu thuật nâng mũi",
    "nâng mũi thẩm mỹ",
    "làm mũi"
];

// Add nang_mui with high weight
trainingData.nang_mui.forEach(text => {
    classifier.addDocument(normalizeText(text), 'nang_mui', 8);
});

// Remove any duplicate training
const addedPhrases = new Set();
Object.keys(trainingData).forEach(intent => {
    trainingData[intent] = trainingData[intent].filter(text => {
        const normalized = normalizeText(text);
        if (addedPhrases.has(normalized)) return false;
        addedPhrases.add(normalized);
        return true;
    });
});

// Thẩm mỹ mắt with proper weight
classifier.addDocument(normalizeText('bác sĩ tư vấn cắt mí giúp em'), 'tham_my_mat', 5);
classifier.addDocument(normalizeText('tư vấn về mắt'), 'tham_my_mat', 5);
classifier.addDocument('biến chứng', 'bien_chung');
classifier.addDocument('bị biến chứng', 'bien_chung');
classifier.addDocument('có biến chứng', 'bien_chung');
classifier.addDocument('gặp biến chứng', 'bien_chung');
classifier.addDocument('biến chứng phẫu thuật', 'bien_chung');
classifier.addDocument('biến chứng thẩm mỹ', 'bien_chung');
classifier.addDocument('biến chứng sau phẫu thuật', 'bien_chung');
classifier.addDocument('tư vấn biến chứng', 'bien_chung');
classifier.addDocument('hỏi về biến chứng', 'bien_chung');
classifier.addDocument('lo biến chứng', 'bien_chung');
classifier.addDocument('sợ biến chứng', 'bien_chung');
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
// Add more specific training data for treo_sa_tre
classifier.addDocument('treo_sa_tre': {
    weight: 12,  // Increased weight
    phrases: [
        "treo sa trễ",
        "sa trễ",
        "ngực sa",
        "ngực trễ",
        "sa trễ ngực",
        "treo ngực sa",
        "treo sa",
        "treo ngực",
        "phẫu thuật sa trễ",
        "khắc phục ngực sa",
        "khắc phục ngực trễ",
        "nâng ngực sa trễ",
        "phẫu thuật treo ngực",
        "tư vấn treo sa trễ",
        "tư vấn ngực sa",
        "hỏi về sa trễ",
        "ngực bị sa",
        "ngực bị trễ"
    ]
},
classifier.addDocument('treo ngực sa', 'treo_sa_tre');
classifier.addDocument('treo sa', 'treo_sa_tre');
classifier.addDocument('treo ngực', 'treo_sa_tre');
classifier.addDocument('phẫu thuật sa trễ', 'treo_sa_tre');

// Make sure there's no overlap with cang_da
classifier.addDocument('căng da', 'cang_da');
classifier.addDocument('căng da mặt', 'cang_da');
classifier.addDocument('căng chỉ', 'cang_da');
classifier.addDocument('căng chỉ mặt', 'cang_da');
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
const intents = {
    weight: 10,
    phrases: [
        "đi // ... existing code ...

// Add training data for treo_sa_tre
const treoSaTreData = [
    "treo sa trễ",
    "sa trễ",
    "ngực sa",
    "ngực trễ",
    "sa trễ ngực",
    "treo ngực sa",
    "treo sa",
    "treo ngực",
    "phẫu thuật sa trễ",
    "khắc phục ngực sa",
    "khắc phục ngực trễ",
    "nâng ngực sa trễ",
    "phẫu thuật treo ngực",
    "tư vấn treo sa trễ",
    "tư vấn ngực sa",
    "hỏi về sa trễ",
    "ngực bị sa",
    "ngực bị trễ"
];

treoSaTreData.forEach(text => {
    classifier.addDocument(normalizeText(text), 'treo_sa_tre', 12);
});

// Add FAQ intents with proper structure
const faqIntents = {
    "faq_nguc_bay": {
        weight: 10,
        phrases: [
            "đi máy bay sau nâng ngực",
            "bay sau nâng ngực",
            "khi nào được đi máy bay",
            "xuất viện sau bao lâu",
            "thời gian nằm viện",
            "bao lâu thì xuất viện",
            "thời gian hồi phục",
            "bao giờ được bay",
            "có thể đi máy bay không",
            "bay quốc tế sau nâng ngực",
            "bay nội địa sau nâng ngực"
        ]
    }
};

// Add FAQ documents with weights
Object.entries(faqIntents).forEach(([intent, data]) => {
    data.phrases.forEach(text => {
        classifier.addDocument(normalizeText(text), intent, data.weight);
    });
});

// ... rest of your code ... sau nâng ngực",
        "bay sau nâng ngực",
        "khi nào được đi máy bay",
        "xuất viện sau bao lâu",
        "thời gian nằm viện",
        "bao lâu thì xuất viện",
        "thời gian hồi phục",
        "bao giờ được bay",
        "có thể đi máy bay không",
        "bay quốc tế sau nâng ngực",
        "bay nội địa sau nâng ngực"
    ]
},

"faq_nang_nguc_dao": {
    weight: 10,
    phrases: [
        "nâng ngực dao siêu âm",
        "nâng ngực không đau",
        "dao mổ siêu âm",
        "nâng ngực ultrasonic",
        "phương pháp nâng ngực không đau",
        "nâng ngực có đau không",
        "nâng ngực bằng dao siêu âm",
        "dao siêu âm nâng ngực",
        "pp nang nguc dao sieu am",
        "phuong pahp nang nguc dao sieu am",
        "phương pháp nâng ngực bằng dao siêu âm"
    ]
},
"faq_size_tui": {
    weight: 12,  // Increased weight for better matching
    phrases: [
        "size túi ngực",
        "form túi ngực",
        "kích thước túi",
        "size nâng ngực",
        "chọn size túi",
        "túi ngực size nào",
        "form túi thế nào",
        "túi ngực loại nào",
        "size phù hợp",
        "kích cỡ túi ngực",
        "tư vấn size túi",
        "tư vấn form túi",
        "chọn form túi",
        "size túi phù hợp",
        "form túi phù hợp"
    ]
},

"faq_thao_tui": {
    weight: 10,
    phrases: [
        "tháo túi ngực",
        "rút túi ngực",
        "tháo túi ngực cũ",
        "thay túi ngực",
        "tháo túi silicon",
        "tháo túi không đau",
        "tháo túi ngực có đau không",
        "tháo túi ngực bao lâu"
    ]
}
classifier.addDocument('treo ngực sa', 'treo_sa_tre');
classifier.addDocument('treo sa', 'treo_sa_tre');
classifier.addDocument('treo ngực', 'treo_sa_tre');
classifier.addDocument('phẫu thuật sa trễ', 'treo_sa_tre');

// Make sure there's no overlap with cang_da
classifier.addDocument('căng da', 'cang_da');
classifier.addDocument('căng da mặt', 'cang_da');
classifier.addDocument('căng chỉ', 'cang_da');
classifier.addDocument('căng chỉ mặt', 'cang_da');
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
// Add corresponding classifier documents
classifier.addDocument('size túi ngực', 'faq_size_tui');
classifier.addDocument('form túi ngực', 'faq_size_tui');
classifier.addDocument('kích thước túi', 'faq_size_tui');
classifier.addDocument('chọn size túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');
classifier.addDocument('size phù hợp', 'faq_size_tui');
classifier.addDocument('kích cỡ túi ngực', 'faq_size_tui');
classifier.addDocument('tư vấn size túi', 'faq_size_tui');
classifier.addDocument('tư vấn form túi', 'faq_size_tui');
classifier.addDocument('túi ngực size nào', 'faq_size_tui');
classifier.addDocument('form túi thế nào', 'faq_size_tui');
classifier.addDocument('túi ngực loại nào', 'faq_size_tui);// ... existing code ...

// Fix the syntax error in the last line
classifier.addDocument('túi ngực loại nào', 'faq_size_tui');

// Add missing intents from training_data.json that aren't already in the file
// Add chao_hoi intent if not already present
if (!trainingData.chao_hoi) {
    trainingData.chao_hoi = [
        "xin chào",
        "chào bạn",
        "hello",
        "hi",
        "chào",
        "xin chào bác sĩ",
        "chào em",
        "có ai ở đó không",
        "bạn ơi",
        "em ơi",
        "chào buổi sáng",
        "chào buổi chiều"
    ];
    
    trainingData.chao_hoi.forEach(text => {
        classifier.addDocument(normalizeText(text), 'chao_hoi');
    });
}

// Add cam_on intent if not already present
if (!trainingData.cam_on) {
    trainingData.cam_on = [
        "cảm ơn",
        "cảm ơn bạn",
        "cảm ơn nhiều",
        "thank you",
        "thanks",
        "cám ơn nhé",
        "cám ơn em",
        "cám ơn bác sĩ"
    ];
    
    trainingData.cam_on.forEach(text => {
        classifier.addDocument(normalizeText(text), 'cam_on');
    });
}

// Add ket_thuc intent if not already present
if (!trainingData.ket_thuc) {
    trainingData.ket_thuc = [
        "tạm biệt",
        "bye",
        "goodbye",
        "hẹn gặp lại",
        "chào tạm biệt",
        "kết thúc",
        "kết thúc cuộc trò chuyện"
    ];
    
    trainingData.ket_thuc.forEach(text => {
        classifier.addDocument(normalizeText(text), 'ket_thuc');
    });
}

// Add hoi_kinh_nghiem intent if not already present
if (!trainingData.hoi_kinh_nghiem) {
    trainingData.hoi_kinh_nghiem = [
        "bác sĩ có kinh nghiệm không",
        "bác sĩ làm được bao nhiêu ca",
        "kinh nghiệm của bác sĩ",
        "bác sĩ làm được bao lâu rồi",
        "bác sĩ có giỏi không",
        "bác sĩ có chuyên môn không",
        "bác sĩ đã làm bao nhiêu ca phẫu thuật",
        "bác sĩ có chứng chỉ không"
    ];
    
    trainingData.hoi_kinh_nghiem.forEach(text => {
        classifier.addDocument(normalizeText(text), 'hoi_kinh_nghiem');
    });
}

// Add thoi_gian_phuc_hoi intent if not already present
if (!trainingData.thoi_gian_phuc_hoi) {
    trainingData.thoi_gian_phuc_hoi = [
        "thời gian hồi phục",
        "bao lâu thì lành",
        "bao lâu thì hết sưng",
        "phục hồi mất bao lâu",
        "bao lâu thì đi làm lại được",
        "thời gian nghỉ dưỡng",
        "bao lâu thì ổn định",
        "khi nào thì lành hẳn",
        "thời gian nghỉ ngơi sau phẫu thuật"
    ];
    
    trainingData.thoi_gian_phuc_hoi.forEach(text => {
        classifier.addDocument(normalizeText(text), 'thoi_gian_phuc_hoi');
    });
}

// Add bao_hanh intent if not already present
if (!trainingData.bao_hanh) {
    trainingData.bao_hanh = [
        "bảo hành bao lâu",
        "có bảo hành không",
        "chế độ bảo hành",
        "thời gian bảo hành",
        "bảo hành trọn đời không",
        "nếu có vấn đề thì sao",
        "bảo hành như thế nào",
        "chính sách bảo hành"
    ];
    
    trainingData.bao_hanh.forEach(text => {
        classifier.addDocument(normalizeText(text), 'bao_hanh');
    });
}

// Add thanh_toan intent if not already present
if (!trainingData.thanh_toan) {
    trainingData.thanh_toan = [
        "thanh toán như thế nào",
        "phương thức thanh toán",
        "trả góp được không",
        "có thể trả góp không",
        "thanh toán bằng thẻ được không",
        "có thanh toán online không",
        "chuyển khoản được không",
        "có giảm giá không",
        "có khuyến mãi không"
    ];
    
    trainingData.thanh_toan.forEach(text => {
        classifier.addDocument(normalizeText(text), 'thanh_toan');
    });
}

// Add hoi_dau intent if not already present
if (!trainingData.hoi_dau) {
    trainingData.hoi_dau = [
        "có đau không",
        "đau lắm không",
        "mức độ đau",
        "có đau nhiều không",
        "đau trong bao lâu",
        "có gây mê không",
        "có tê không",
        "cảm giác đau thế nào",
        "có cách giảm đau không"
    ];
    
    trainingData.hoi_dau.forEach(text => {
        classifier.addDocument(normalizeText(text), 'hoi_dau');
    });
}

// Add hoi_an_toan intent if not already present
if (!trainingData.hoi_an_toan) {
    trainingData.hoi_an_toan = [
        "có an toàn không",
        "độ an toàn",
        "rủi ro là gì",
        "nguy hiểm không",
        "tỉ lệ thành công",
        "có nguy cơ gì không",
        "có ai gặp vấn đề không",
        "có an toàn tuyệt đối không",
        "mức độ an toàn"
    ];
    
    trainingData.hoi_an_toan.forEach(text => {
        classifier.addDocument(normalizeText(text), 'hoi_an_toan');
    });
}

// Add hoi_san_pham intent if not already present
if (!trainingData.hoi_san_pham) {
    trainingData.hoi_san_pham = [
        "sử dụng sản phẩm gì",
        "túi ngực hãng nào",
        "chất liệu túi ngực",
        "sản phẩm có chất lượng không",
        "nguồn gốc sản phẩm",
        "sản phẩm nhập từ đâu",
        "có chứng nhận không",
        "sản phẩm chính hãng không"
    ];
    
    trainingData.hoi_san_pham.forEach(text => {
        classifier.addDocument(normalizeText(text), 'hoi_san_pham');
    });
}

// Fix the treo_sa_tre object definition
const treo_sa_tre_phrases = [
    "treo sa trễ",
    "sa trễ",
    "ngực sa",
    "ngực trễ",
    "sa trễ ngực",
    "treo ngực sa",
    "treo sa",
    "treo ngực",
    "phẫu thuật sa trễ",
    "khắc phục ngực sa",
    "khắc phục ngực trễ",
    "nâng ngực sa trễ",
    "phẫu thuật treo ngực",
    "tư vấn treo sa trễ",
    "tư vấn ngực sa",
    "hỏi về sa trễ",
    "ngực bị sa",
    "ngực bị trễ"
];

treo_sa_tre_phrases.forEach(phrase => {
    classifier.addDocument(normalizeText(phrase), 'treo_sa_tre', 12);
});

// Fix the faq_nguc_bay object definition
const faq_nguc_bay_phrases = [
    "đi máy bay sau nâng ngực",
    "bay sau nâng ngực",
    "khi nào được đi máy bay",
    "xuất viện sau bao lâu",
    "thời gian nằm viện",
    "bao lâu thì xuất viện",
    "thời gian hồi phục",
    "bao giờ được bay",
    "có thể đi máy bay không",
    "bay quốc tế sau nâng ngực",
    "bay nội địa sau nâng ngực",
    "xuất viện sau nâng ngực"
];

faq_nguc_bay_phrases.forEach(phrase => {
    classifier.addDocument(normalizeText(phrase), 'faq_nguc_bay', 10);
});

// Fix the faq_nang_nguc_dao object definition
const faq_nang_nguc_dao_phrases = [
    "nâng ngực dao siêu âm",
    "nâng ngực không đau",
    "dao mổ siêu âm",
    "nâng ngực ultrasonic",
    "phương pháp nâng ngực không đau",
    "nâng ngực có đau không",
    "nâng ngực bằng dao siêu âm",
    "dao siêu âm nâng ngực",
    "pp nang nguc dao sieu am",
    "phuong pahp nang nguc dao sieu am",
    "phương pháp nâng ngực bằng dao siêu âm"
];

faq_nang_nguc_dao_phrases.forEach(phrase => {
    classifier.addDocument(normalizeText(phrase), 'faq_nang_nguc_dao', 10);
});

// Fix the faq_thao_tui object definition
const faq_thao_tui_phrases = [
    "tháo túi ngực",
    "rút túi ngực",
    "tháo túi ngực cũ",
    "thay túi ngực",
    "tháo túi silicon",
    "tháo túi không đau",
    "tháo túi ngực có đau không",
    "tháo túi ngực bao lâu"
];

faq_thao_tui_phrases.forEach(phrase => {
    classifier.addDocument(normalizeText(phrase), 'faq_thao_tui', 10);
});

// Add missing price-related intents
const price_intents = {
    "gia_nang_nguc": [
        "giá nâng ngực",
        "chi phí nâng ngực",
        "phí đặt túi ngực",
        "nâng ngực giá bao nhiêu",
        "chi phí phẫu thuật ngực",
        "giá thay túi ngực",
        "chi phí tháo túi ngực",
        "phí bóc bao xơ",
        "báo giá nâng ngực",
        "nâng ngực hết bao nhiêu tiền"
    ],
    "gia_nang_mui": [
        "giá nâng mũi",
        "chi phí nâng mũi",
        "phí sửa mũi",
        "nâng mũi giá bao nhiêu",
        "chi phí phẫu thuật mũi",
        "giá nâng mũi sụn sườn",
        "chi phí chỉnh mũi",
        "sửa mũi hết bao nhiêu",
        "báo giá nâng mũi",
        "phí nâng mũi cấu trúc"
    ],
    "gia_mat": [
        "giá cắt mí",
        "chi phí nhấn mí",
        "phí bấm mí",
        "cắt mí giá bao nhiêu",
        "chi phí phẫu thuật mắt",
        "giá treo cung mày",
        "chi phí chỉnh mắt",
        "phẫu thuật mắt giá bao nhiêu",
        "báo giá cắt mí"
    ],
    "gia_tham_my_cam": [
        "giá độn cằm",
        "chi phí gọt cằm",
        "phí chỉnh cằm",
        "độn cằm giá bao nhiêu",
        "chi phí làm cằm v-line",
        "giá phẫu thuật cằm",
        "thẩm mỹ cằm giá bao nhiêu"
    ],
    "gia_hut_mo": [
        "giá hút mỡ",
        "chi phí hút mỡ bụng",
        "phí giảm mỡ",
        "hút mỡ giá bao nhiêu",
        "chi phí hút mỡ đùi",
        "giá hút mỡ lưng",
        "chi phí hút mỡ tay",
        "phí tạo hình thành bụng"
    ],
    "gia_cang_da": [
        "giá căng da mặt",
        "chi phí trẻ hóa da",
        "phí căng chỉ",
        "căng da giá bao nhiêu",
        "chi phí xóa nhăn",
        "giá căng da toàn diện",
        "phí căng chỉ collagen"
    ],
    "gia_vung_kin": [
        "giá thẩm mỹ vùng kín",
        "chi phí se khít",
        "phí tạo hình vùng kín",
        "thẩm mỹ vùng kín giá bao nhiêu",
        "chi phí trẻ hóa vùng kín"
    ]
};

// Add price-related intents if not already present
Object.keys(price_intents).forEach(intent => {
    if (!trainingData[intent]) {
        trainingData[intent] = price_intents[intent];
        
        price_intents[intent].forEach(text => {
            classifier.addDocument(normalizeText(text), intent, 8);
        });
    }
});

// Add code to train and save the model if not already present
// Train the classifier
classifier.train();

// Save the trained model
classifier.save('model.json', (err) => {
    if (err) {
        console.error('Error saving model:', err);
    } else {
        console.log('Model trained and saved successfully!');
    }
});