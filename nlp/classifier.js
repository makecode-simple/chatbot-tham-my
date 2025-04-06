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
                    "tư vấn nâng ngực",
                    "nâng ngực giá bao nhiêu",
                    "phẫu thuật ngực có đau không",
                    "muốn nâng ngực",
                    "chi phí đặt túi ngực"
                ],
                "nang_mui": [
                    "nâng mũi hết bao nhiêu",
                    "tư vấn nâng mũi",
                    "phẫu thuật mũi",
                    "muốn sửa mũi",
                    "nâng mũi sụn sườn"
                ]
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