const SimpleNLPClassifier = require('./nlp/classifier');
const classifier = new SimpleNLPClassifier();

// Confidence threshold for intent classification
const CONFIDENCE_THRESHOLD = 0.6;
const DEFAULT_INTENT = 'menu_dich_vu';

// Cache for model predictions
const predictionCache = new Map();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

// Load và train model khi khởi động
(async () => {
    try {
        await classifier.train();
        console.log('✅ NLP model trained successfully');
    } catch (err) {
        console.error('❌ Error training NLP model:', err);
        process.exit(1); // Exit if model training fails
    }
})();

async function predictIntent(message) {
    if (!message) {
        return { intent: DEFAULT_INTENT, confidence: 0 };
    }

    try {
        // Check cache first
        const cacheKey = message.toLowerCase().trim();
        const cachedResult = predictionCache.get(cacheKey);
        if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
            return cachedResult.prediction;
        }

        // Get prediction and confidence
        const prediction = classifier.predict(message);
        const confidence = classifier.getConfidence(message);

        const result = {
            intent: confidence >= CONFIDENCE_THRESHOLD ? prediction : DEFAULT_INTENT,
            confidence: confidence
        };

        // Cache the result
        predictionCache.set(cacheKey, {
            prediction: result,
            timestamp: Date.now()
        });

        return result;
    } catch (err) {
        console.error('❌ Error predicting intent:', err);
        return { intent: DEFAULT_INTENT, confidence: 0 };
    }
}

// Clean up expired cache entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of predictionCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            predictionCache.delete(key);
        }
    }
}, CACHE_TTL);

// Retrain model function
async function retrainModel() {
    try {
        await classifier.train();
        predictionCache.clear(); // Clear cache after retraining
        console.log('✅ Model retrained successfully');
        return true;
    } catch (err) {
        console.error('❌ Error retraining model:', err);
        return false;
    }
}

module.exports = { 
    predictIntent,
    retrainModel,
    CONFIDENCE_THRESHOLD
};