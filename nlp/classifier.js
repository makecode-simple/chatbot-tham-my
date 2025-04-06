const natural = require('natural');
const fs = require('fs');

class SimpleNLPClassifier {
    constructor() {
        this.classifier = new natural.BayesClassifier();
        this.trained = false;
    }

    async train() {
        const trainingData = JSON.parse(fs.readFileSync('./data/training_data.json', 'utf8'));
        
        trainingData.forEach(item => {
            item.examples.forEach(example => {
                this.classifier.addDocument(this.normalizeText(example), item.intent);
            });
        });

        this.classifier.train();
        this.trained = true;
        
        // Save model
        this.classifier.save('model.json', (err) => {
            if (err) console.error('Error saving model:', err);
            else console.log('Model saved successfully');
        });
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