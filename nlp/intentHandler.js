const natural = require('natural');
const classifier = new natural.BayesClassifier();

function normalizeText(text) {
    return text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[!.,?]/g, "");
}

// Load trained model
classifier.load('model.json', null, function(err) {
    if (err) {
        console.error('Error loading model:', err);
    } else {
        console.log('✅ NLP model loaded successfully!');
    }
});

function handleIntent(message) {
    const intent = classifier.classify(normalizeText(message));
    return intent;
}

module.exports = { handleIntent };