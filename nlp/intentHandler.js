const natural = require('natural');
const fs = require('fs');
const path = require('path');

class IntentClassifier {
    constructor() {
        this.classifier = new natural.BayesClassifier();
        this.trained = false;
        this.confidenceThreshold = 0.6;  // Increased base threshold for better accuracy
        this.minConfidenceDiff = 0.2;   // Increased minimum confidence difference
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
                'nang_nguc': 2.0,     // Boost nâng ngực intent more
                'tham_my_mat': 1.5,   // Boost thẩm mỹ mắt intent
                'faq_nguc_bay': 1.3,  // Increased weight
                'faq_thao_tui': 1.3,  // Increased weight
                'bien_chung': 1.0,    // Reduced weight
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
        if (!text) return '';
        // Convert to lowercase and normalize unicode
        let normalized = text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
            .replace(/[!.,?]/g, "")         // Remove punctuation
            .replace(/\s+/g, ' ')           // Normalize spaces
            .trim();

        // Map common variations and keywords
        const variations = {
            // Nâng mũi variations
            'nang mui': 'nang mui',
            'chinh mui': 'nang mui',
            'sua mui': 'nang mui',
            'lam mui': 'nang mui',
            'phau thuat mui': 'nang mui',
            'mui': 'nang mui',
            // Nâng ngực variations
            'nang nguc': 'nang nguc',
            'phau thuat nguc': 'nang nguc',
            'dat tui nguc': 'nang nguc',
            'tui nguc': 'nang nguc',
            'lam nguc': 'nang nguc',
            'nang sinh': 'nang nguc',
            'nguc': 'nang nguc',
            'vu': 'nang nguc',
            'nguc dep': 'nang nguc',
            'nang vu': 'nang nguc',
            'tui vu': 'nang nguc',
            'phau thuat vu': 'nang nguc',
            // Greeting variations
            'hi': 'chao hoi',
            'hello': 'chao hoi',
            'hey': 'chao hoi',
            'alo': 'chao hoi',
            'chao': 'chao hoi'
        };

        // Check if the normalized text matches any variations
        return variations[normalized] || normalized;
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
        console.log(`🔄 Normalized text: "${normalizedText}"`);

        try {
            // Direct mapping for common intents
            if (normalizedText === 'nang mui' || normalizedText.includes('nang mui')) {
                console.log('✅ Direct match for nang_mui intent');
                return 'nang_mui';
            }
            if (normalizedText === 'nang nguc' || normalizedText.includes('nang nguc')) {
                console.log('✅ Direct match for nang_nguc intent');
                return 'nang_nguc';
            }

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

            // Special handling for common intents
            if (normalizedText.includes('mui')) {
                const muiIntent = classifications.find(c => c.label === 'nang_mui');
                if (muiIntent && muiIntent.value > 0.5) {
                    console.log(`✅ Found nang_mui intent with confidence: ${(muiIntent.value * 100).toFixed(1)}%`);
                    return 'nang_mui';
                }
            }
            
            if (normalizedText.includes('nguc') || normalizedText.includes('vu')) {
                const ngucIntent = classifications.find(c => c.label === 'nang_nguc');
                if (ngucIntent && ngucIntent.value > 0.5) {
                    console.log(`✅ Found nang_nguc intent with confidence: ${(ngucIntent.value * 100).toFixed(1)}%`);
                    return 'nang_nguc';
                }
            }

            // Check if confidence meets our threshold
            if (confidence < this.confidenceThreshold) {
                console.log(`⚠️ Low confidence (${(confidence * 100).toFixed(1)}%) for message: "${message}". Fallback to menu_dich_vu`);
                return 'menu_dich_vu';
            }

            // Prevent certain intents from being triggered too easily
            const highConfidenceIntents = ['faq_size_tui', 'faq_thao_tui', 'faq_nguc_bay'];
            if (highConfidenceIntents.includes(intent) && confidence < 0.7) {
                console.log(`⚠️ Preventing ${intent} with low confidence: ${(confidence * 100).toFixed(1)}%`);
                return 'menu_dich_vu';
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