const natural = require('natural');
const fs = require('fs');
const path = require('path');

class IntentClassifier {
    constructor() {
        this.classifier = new natural.BayesClassifier();
        this.trained = false;
        this.confidenceThreshold = 0.4;  // Lowered base threshold since we're using relative confidence
        this.minConfidenceDiff = 0.15;   // Minimum confidence difference between top 2 intents
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

            // Reset classifier
            this.classifier = new natural.BayesClassifier();

            // Add weights for specific intents that need boosting
            const weightedIntents = {
                'nang_mui': 1.5,      // Boost nâng mũi intent
                'nang_nguc': 1.5,     // Boost nâng ngực intent
                'tham_my_mat': 1.5,   // Boost thẩm mỹ mắt intent
                'faq_nguc_bay': 1.2,
                'faq_thao_tui': 1.2,
                'faq_size_tui': 1.0,  // Reduced weight for this intent
                'bien_chung': 1.3,
                'treo_sa_tre': 1.2
            };

            // Count total examples per intent for logging
            const intentCounts = {};

            trainingData.intents.forEach(item => {
                const weight = weightedIntents[item.intent] || 1;
                intentCounts[item.intent] = item.examples.length;

                // Add each example multiple times based on weight
                item.examples.forEach(example => {
                    // Normalize and add the original example
                    const normalizedExample = this.normalizeText(example);
                    this.classifier.addDocument(normalizedExample, item.intent);

                    // For weighted intents, add the example multiple times
                    if (weight > 1) {
                        const timesToAdd = Math.floor((weight - 1) * 10);
                        for (let i = 0; i < timesToAdd; i++) {
                            this.classifier.addDocument(normalizedExample, item.intent);
                        }
                    }
                });
            });

            this.classifier.train();
            this.trained = true;

            // Log training statistics
            console.log('✅ NLP model trained successfully!');
            console.log('📊 Training statistics:');
            Object.entries(intentCounts)
                .sort((a, b) => b[1] - a[1])
                .forEach(([intent, count]) => {
                    const weight = weightedIntents[intent] || 1;
                    console.log(`   ${intent}: ${count} examples (weight: ${weight})`);
                });

        } catch (err) {
            console.error('❌ Error training model:', err);
            this.trained = false;
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
            return 'menu_dich_vu';
        }

        if (!message) return 'menu_dich_vu';
        
        const normalizedText = this.normalizeText(message);
        try {
            // Get all classifications with their confidence scores
            const classifications = this.classifier.getClassifications(normalizedText);
            
            // Log all intents and their confidence scores for debugging
            console.log('🔍 All classifications:', 
                classifications.map(c => `${c.label}: ${(c.value * 100).toFixed(1)}%`)
            );

            // Get the top intent and its confidence
            const topIntent = classifications[0];
            
            if (!topIntent) {
                console.log('⚠️ No intent detected');
                return 'menu_dich_vu';
            }

            const confidence = topIntent.value;
            const intent = topIntent.label;

            // Check if confidence meets our threshold
            if (confidence < this.confidenceThreshold) {
                console.log(`⚠️ Low confidence (${(confidence * 100).toFixed(1)}%) for message: "${message}". Fallback to menu_dich_vu`);
                return 'menu_dich_vu';
            }

            // If we have a second best intent, check if it's too close to the top intent
            if (classifications.length > 1) {
                const secondBest = classifications[1];
                const confidenceDiff = confidence - secondBest.value;
                
                // If the difference is too small (less than 20%), fall back to menu
                if (confidenceDiff < 0.2) {
                    console.log(`⚠️ Ambiguous intent - top two are too close: ${intent} (${(confidence * 100).toFixed(1)}%) vs ${secondBest.label} (${(secondBest.value * 100).toFixed(1)}%)`);
                    return 'menu_dich_vu';
                }
            }

            console.log(`🎯 Detected intent: ${intent} (confidence: ${(confidence * 100).toFixed(1)}%)`);
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