const natural = require('natural');
const fs = require('fs');
const path = require('path');

class SimpleNLPClassifier {
    constructor() {
        this.classifier = new natural.BayesClassifier();
        this.trained = false;
    }

    async train() {
        try {
            const trainingData = {
                "nang_nguc": [
                    "tư vấn nâng ngực", "nâng ngực giá bao nhiêu", 
                    "phẫu thuật ngực có đau không", "muốn nâng ngực",
                    "chi phí đặt túi ngực", "nâng ngực ở đâu tốt",
                    "nâng ngực có để lại sẹo không", "nâng ngực bao lâu thì lành",
                    "tháo túi ngực", "thay túi ngực", "nâng ngực an toàn không",
                    "đặt túi ngực", "độn ngực", "độn túi ngực",
                    "nâng ngực nội soi", "phẫu thuật ngực", "làm ngực",
                    "ngực to hơn", "tháo túi ngực cũ", "bóc bao xơ",
                    "tái tạo vú sau ung thư", "nâng ngực chảy xệ"
                ],
                "nang_mui": [
                    "nâng mũi hết bao nhiêu", "tư vấn nâng mũi",
                    "phẫu thuật mũi", "muốn sửa mũi", "nâng mũi sụn sườn",
                    "nâng mũi có đau không", "chỉnh sửa mũi hỏng",
                    "mũi bị lệch", "mũi bị biến chứng", "sửa mũi hỏng",
                    "nâng mũi tái cấu trúc", "làm mũi", "độn mũi",
                    "nâng cao sống mũi", "mũi tẹt", "mũi ngắn", 
                    "mũi to", "sửa đầu mũi", "chỉnh mũi lỗi"
                ],
                "tham_my_mat": [
                    "cắt mí mắt", "nhấn mí", "bấm mí",
                    "tư vấn về mắt", "phẫu thuật mắt", "mắt bị xệ",
                    "mắt một mí", "mắt không đều", "treo cung mày",
                    "chỉnh sửa mắt", "mắt to", "mắt nhỏ", 
                    "mắt xếch", "mắt ba rọi", "lấy mỡ mí mắt",
                    "chữa sụp mí", "mở rộng góc mắt"
                ],
                "tham_my_cam": [
                    "độn cằm", "gọt cằm", "cằm ngắn", "cằm lệch",
                    "chỉnh cằm", "làm cằm vline", "cằm bị hô",
                    "cằm chẻ", "cằm nhọn", "cằm vuông", 
                    "thẩm mỹ cằm", "làm thon gọn cằm"
                ],
                "hut_mo": [
                    "hút mỡ bụng", "giảm mỡ bụng", "lipo bụng",
                    "giảm béo bụng", "hút mỡ nội soi",
                    "hút mỡ tay", "hút mỡ đùi", "hút mỡ lưng",
                    "tạo hình thành bụng", "giảm mỡ không phẫu thuật"
                ],
                "cang_da": [
                    "căng da mặt", "trẻ hóa da", "căng chỉ",
                    "căng da chảy xệ", "xóa nhăn", "làm căng da mặt",
                    "căng da không phẫu thuật", "căng da bằng chỉ",
                    "căng chỉ collagen", "xóa nếp nhăn mặt",
                    "căng da toàn diện", "trẻ hóa da mặt"
                ],
                "tham_my_vung_kin": [
                    "thẩm mỹ vùng kín", "se khít vùng kín",
                    "trẻ hóa vùng kín", "phẫu thuật vùng kín",
                    "làm hồng vùng kín", "tạo hình vùng kín"
                ],
                "dia_chi": [
                    "địa chỉ ở đâu", "phòng khám ở đâu",
                    "cho hỏi địa chỉ", "địa điểm phòng khám",
                    "bệnh viện ở đâu", "địa chỉ bác sĩ",
                    "phòng khám nằm ở đâu", "đường đi đến phòng khám",
                    "d/c ở đâu", "d/c o dau",
                    "địa chỉ phòng khám", "dia chi phong kham",
                    "địa chỉ bác sĩ vũ", "dia chi bac si vu",
                    "address ở đâu", "address o dau",
                    "add ở đâu", "add o dau",
                    "chỗ khám ở đâu", "cho kham o dau",
                    "văn phòng ở đâu", "van phong o dau",
                    "cơ sở ở đâu", "co so o dau",
                    "địa điểm", "dia diem",
                    "nơi khám", "noi kham"
                ],
                "dat_lich": [
                    "đặt lịch", "hẹn khám", "đăng ký tư vấn",
                    "muốn gặp bác sĩ", "lịch khám", "đặt hẹn",
                    "xin số điện thoại", "cho xin địa chỉ",
                    "muốn được tư vấn", "tư vấn trực tiếp",
                    "book lịch", "lịch trống"
                ],
                "gia_nang_nguc": [
                    "giá nâng ngực", "chi phí nâng ngực", "phí đặt túi ngực",
                    "nâng ngực giá bao nhiêu", "chi phí phẫu thuật ngực",
                    "giá thay túi ngực", "chi phí tháo túi ngực",
                    "phí bóc bao xơ", "báo giá nâng ngực",
                    "nâng ngực hết bao nhiêu tiền"
                ],
                "gia_nang_mui": [
                    "giá nâng mũi", "chi phí nâng mũi", "phí sửa mũi",
                    "nâng mũi giá bao nhiêu", "chi phí phẫu thuật mũi",
                    "giá nâng mũi sụn sườn", "chi phí chỉnh mũi",
                    "sửa mũi hết bao nhiêu", "báo giá nâng mũi",
                    "phí nâng mũi cấu trúc"
                ],
                "gia_mat": [
                    "giá cắt mí", "chi phí nhấn mí", "phí bấm mí",
                    "cắt mí giá bao nhiêu", "chi phí phẫu thuật mắt",
                    "giá treo cung mày", "chi phí chỉnh mắt",
                    "phẫu thuật mắt giá bao nhiêu", "báo giá cắt mí"
                ],
                "gia_tham_my_cam": [
                    "giá độn cằm", "chi phí gọt cằm", "phí chỉnh cằm",
                    "độn cằm giá bao nhiêu", "chi phí làm cằm v-line",
                    "giá phẫu thuật cằm", "thẩm mỹ cằm giá bao nhiêu"
                ],
                "gia_hut_mo": [
                    "giá hút mỡ", "chi phí hút mỡ bụng", "phí giảm mỡ",
                    "hút mỡ giá bao nhiêu", "chi phí hút mỡ đùi",
                    "giá hút mỡ lưng", "chi phí hút mỡ tay",
                    "phí tạo hình thành bụng"
                ],
                "gia_cang_da": [
                    "giá căng da mặt", "chi phí trẻ hóa da",
                    "phí căng chỉ", "căng da giá bao nhiêu",
                    "chi phí xóa nhăn", "giá căng da toàn diện",
                    "phí căng chỉ collagen"
                ],
                "gia_vung_kin": [
                    "giá thẩm mỹ vùng kín", "chi phí se khít",
                    "phí tạo hình vùng kín", "thẩm mỹ vùng kín giá bao nhiêu",
                    "chi phí trẻ hóa vùng kín"
                ],
                "hoi_gia": [  // keep this for general pricing questions
                    "bảng giá", "giá các dịch vụ",
                    "chi phí thẩm mỹ", "phí dịch vụ",
                    "giá cả thế nào", "báo giá tổng",
                    "giá bao nhiêu", "chi phí", "bảng giá",
                    "phí phẫu thuật", "giá cả thế nào", "báo giá",
                    "giá tiền", "tổng chi phí", "phí dịch vụ",
                    "giá phẫu thuật", "chi phí thẩm mỹ"
                ]
                // Remove this problematic part:
                /*
                    "giá bao nhiêu", "chi phí", "bảng giá",
                    "phí phẫu thuật", "giá cả thế nào", "báo giá",
                    "giá tiền", "tổng chi phí", "phí dịch vụ",
                    "giá phẫu thuật", "chi phí thẩm mỹ"
                ]
                */
            };

            // Add documents to classifier
            Object.keys(trainingData).forEach(intent => {
                trainingData[intent].forEach(text => {
                    this.classifier.addDocument(this.normalizeText(text), intent);
                });
            });

            this.classifier.train();
            this.trained = true;
            console.log('✅ Model trained successfully');
        } catch (err) {
            console.error('❌ Error training model:', err);
            throw err;
        }
    }

    normalizeText(text) {
        return text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[!.,?]/g, "");
    }

    predict(text) {
        if (!this.trained) {
            throw new Error('Classifier not trained');
        }
        return this.classifier.classify(this.normalizeText(text));
    }
}

module.exports = SimpleNLPClassifier;