const SimpleNLPClassifier = require('./nlp/classifier');
const classifier = new SimpleNLPClassifier();

// Load và train model khi khởi động
(async () => {
    try {
        await classifier.train();
        console.log('✅ NLP model trained successfully');
    } catch (err) {
        console.error('❌ Error training NLP model:', err);
    }
})();

async function predictIntent(message) {
    try {
        const intent = classifier.predict(message);
        return {
            intent,
            confidence: 0.8 // Simplified confidence score
        };
    } catch (err) {
        console.error('❌ Error predicting intent:', err);
        return { intent: 'unknown', confidence: 0 };
    }
}

module.exports = { predictIntent };