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
classifier.addDocument('túi ngực loại nào', 'fa