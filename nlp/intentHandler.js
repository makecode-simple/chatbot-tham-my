const natural = require('natural');
const fs = require('fs');
const path = require('path');

class IntentClassifier {
    constructor() {
        this.classifier = new natural.BayesClassifier();
        this.trained = false;
        this.confidenceThreshold = 0.7;
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

            // Add weights for specific intents
            const weightedIntents = {
                'faq_nguc_bay': 1.2,
                'faq_thao_tui': 1.2,
                'faq_size_tui': 1.2,
                'bien_chung': 1.3,
                'treo_sa_tre': 1.2
            };

            trainingData.intents.forEach(item => {
                const weight = weightedIntents[item.intent] || 1;
                item.examples.forEach(example => {
                    this.classifier.addDocument(this.normalizeText(example), item.intent, weight);
                });
            });

            this.classifier.train();
            this.trained = true;
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
            .replace(/[!.,?]/g, "")
            .trim();
    }

    getConfidence(message) {
        if (!this.trained || !message) return 0;
        const normalizedText = this.normalizeText(message);
        try {
            return this.classifier.getClassifications(normalizedText)[0].value;
        } catch (err) {
            console.error('❌ Error getting confidence:', err);
            return 0;
        }
    }

    predict(message) {
        if (!this.trained) {
            console.error('❌ Model not trained');
            return 'unknown';
        }

        if (!message) return 'unknown';
        
        const normalizedText = this.normalizeText(message);
        try {
            const confidence = this.getConfidence(message);
            
            // Return 'menu_dich_vu' for low confidence predictions
            if (confidence < this.confidenceThreshold) {
                console.log(`⚠️ Low confidence (${confidence}) for: "${message}"`);
                return 'menu_dich_vu';
            }

            const intent = this.classifier.classify(normalizedText);
            console.log(`🎯 Detected intent: ${intent} (confidence: ${confidence})`);
            return intent;
        } catch (err) {
            console.error('❌ Error predicting:', err);
            return 'menu_dich_vu';
        }
    }

    // Add method to retrain with new data
    addTrainingData(examples, intent) {
        if (!examples || !intent) return;
        
        examples.forEach(example => {
            this.classifier.addDocument(this.normalizeText(example), intent);
        });
        
        this.classifier.train();
        console.log(`✅ Added new training data for intent: ${intent}`);
    }
}

const classifier = new IntentClassifier();

function handleIntent(message) {
    return classifier.predict(message);
}

module.exports = { 
    handleIntent,
    classifier // Export classifier instance for potential retraining
};