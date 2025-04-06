const natural = require('natural');
const fs = require('fs');

class IntentClassifier {
    constructor() {
        this.classifier = new natural.BayesClassifier();
        this.loadModel();
    }

    loadModel() {
        try {
            const modelData = JSON.parse(fs.readFileSync('model.json', 'utf8'));
            this.classifier = natural.BayesClassifier.restore(modelData);
            console.log('✅ NLP model loaded successfully!');
        } catch (err) {
            console.error('❌ Error loading model:', err);
            // Initialize with empty classifier if model fails to load
            this.classifier = new natural.BayesClassifier();
        }
    }

    normalizeText(text) {
        return text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[!.,?]/g, "");
    }

    predict(message) {
        const normalizedText = this.normalizeText(message);
        return this.classifier.classify(normalizedText);
    }
}

const classifier = new IntentClassifier();

function handleIntent(message) {
    return classifier.predict(message);
}

module.exports = { handleIntent };