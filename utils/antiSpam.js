const { EmbedBuilder } = require("discord.js");

const recentMessages = new Map();

const SPAM_THRESHOLD = 5;
const SYMBOL_THRESHOLD = 10;
const SPAM_TIME_LIMIT = 5000;

function detectSpam(message) {
    const { content, author, channel } = message;

    if (author.bot) return;

    const words = content.split(/\s+/);
    const repeatedWords = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
    }, {});

    const hasRepeatedWords = Object.values(repeatedWords).some(count => count >= SPAM_THRESHOLD);

    if (hasRepeatedWords) {
        channel.messages.fetch({ limit: 50 }).then(messages => {
            const userMessages = messages.filter(msg => msg.author.id === author.id);
            userMessages.forEach(msg => msg.delete().catch(console.error));
        });

        const embed = new EmbedBuilder()
            .setColor("RED")
            .setTitle("Spam Warning!")
            .setDescription("Your message was deleted for sending the same word too many times in a short period.")
            .setTimestamp();

        author.send({ embeds: [embed] }).catch(console.error);
        return;
    }

    const symbolCount = content.split('').filter(char => /[\p{Emoji}\p{Symbol}]/u.test(char)).length;
    if (symbolCount > SYMBOL_THRESHOLD) {
        message.delete().catch(console.error);

        const embed = new EmbedBuilder()
            .setColor("RED")
            .setTitle("Spam Warning!")
            .setDescription("Your message was deleted for containing too many symbols or emojis.")
            .setTimestamp();

        author.send({ embeds: [embed] }).catch(console.error);
    }
}

module.exports = { detectSpam };
