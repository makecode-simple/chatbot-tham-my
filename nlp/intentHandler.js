const natural = require('natural');
const fs = require('fs');
const path = require('path');

class IntentClassifier {
    constructor() {
        this.classifier = new natural.BayesClassifier();
        this.trainModel();
    }

    trainModel() {
        try {
            const trainingData = JSON.parse(
                fs.readFileSync(
                    path.join(__dirname, '../data/training_data.json'),
                    'utf8'
                )
            );

            trainingData.intents.forEach(item => {
                item.examples.forEach(example => {
                    this.classifier.addDocument(this.normalizeText(example), item.intent);
                });
            });

            this.classifier.train();
            console.log('✅ NLP model trained successfully!');
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

    predict(message) {
        if (!message) return 'unknown';
        const normalizedText = this.normalizeText(message);
        try {
            return this.classifier.classify(normalizedText);
        } catch (err) {
            console.error('❌ Error predicting:', err);
            return 'unknown';
        }
    }
}

const classifier = new IntentClassifier();

function handleIntent(message) {
    return classifier.predict(message);
}

module.exports = { handleIntent };