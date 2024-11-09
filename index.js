const { Client, Collection, GatewayIntentBits, Partials, ActivityType, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.User,
        Partials.Message,
        Partials.GuildMember,
        Partials.ThreadMember
    ]
});

client.config = require("./config.json");
client.events = new Collection();
client.commands = new Collection();

const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");

const SPAM_THRESHOLD = 3; 
const SYMBOL_THRESHOLD = 25; 
const SPAM_TIME_LIMIT = 10000; 
const DUPLICATE_MESSAGE_LIMIT = 3;
const MESSAGE_HISTORY_LIMIT = 100; 
const userMessageHistory = new Map(); 

function updateActivity(statusText) {
    client.user.setActivity(` ${statusText} 💰`, { type: ActivityType.Watching });
}

function detectSpam(message) {
    const { content, author, channel } = message;

    if (author.bot) return;

    const now = Date.now();

    const history = userMessageHistory.get(author.id) || [];
    const recentMessages = history.filter(msg => now - msg.timestamp < SPAM_TIME_LIMIT);

    recentMessages.push({ content, timestamp: now });
    userMessageHistory.set(author.id, recentMessages);

    const contentWithoutMentions = content.replace(/<@!\d+>/g, "").replace(/<@&\d+>/g, ""); 

    const wordCounts = contentWithoutMentions.split(/\s+/).reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
    }, {});

    const hasRepeatedWords = Object.values(wordCounts).some(count => count >= SPAM_THRESHOLD);
    if (hasRepeatedWords) {
        message.delete().catch(error => {
            if (error.code === 10008) {
                console.log("Attempted to delete an unknown or already deleted message.");
            } else {
                console.error("Error deleting message:", error);
            }
        });

        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("⚠️ Spam Warning ⚠️")
            .setDescription("Your message was deleted for repeatedly sending the same word in a single message.")
            .setTimestamp();

        author.send({ embeds: [embed] }).catch(console.error);
        return; 
    }

    const contentWithoutMentionsForSymbols = content.replace(/<@!\d+>/g, "") 
        .replace(/<@&\d+>/g, "") 
        .split('')
        .filter(char => /[\p{Emoji}\p{Symbol}]/u.test(char)) 
        .length;

    if (contentWithoutMentionsForSymbols > SYMBOL_THRESHOLD) {
        if (!content.includes("<@!") && !content.includes("<@&")) {
            message.delete().catch(error => {
                if (error.code === 10008) {
                    console.log("Attempted to delete an unknown or already deleted message.");
                } else {
                    console.error("Error deleting message:", error);
                }
            });

            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("⚠️ Spam Warning ⚠️")
                .setDescription("Your message was deleted for containing too many symbols or emojis.")
                .setTimestamp();

            author.send({ embeds: [embed] }).catch(console.error);
            return;
        }
    }

    const contentWithoutMentionsForDuplicates = content.replace(/<@!\d+>/g, "").replace(/<@&\d+>/g, "");
    const duplicateMessages = recentMessages.filter(msg =>
        msg.content.replace(/<@!\d+>/g, "").toLowerCase() === contentWithoutMentionsForDuplicates.toLowerCase());

    if (duplicateMessages.length > DUPLICATE_MESSAGE_LIMIT) {
        duplicateMessages.slice(1).forEach(dupMsg => {
            channel.messages.fetch({ limit: MESSAGE_HISTORY_LIMIT }).then(messages => {
                const msgToDelete = messages.find(m => m.content === dupMsg.content && m.author.id === author.id && now - m.createdTimestamp < SPAM_TIME_LIMIT);
                if (msgToDelete) {
                    msgToDelete.delete().catch(error => {
                        if (error.code === 10008) {
                            console.log("Attempted to delete an unknown or already deleted message.");
                        } else {
                            console.error("Error deleting message:", error);
                        }
                    });
                }
            }).catch(console.error);
        });

        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("⚠️ Spam Warning ⚠️")
            .setDescription("Your message was deleted for repeatedly sending duplicate messages.")
            .setTimestamp();

        author.send({ embeds: [embed] }).catch(console.error);
    }
}

client.once('ready', () => {
    console.log(`${client.user.tag} has started successfully.`);
    updateActivity("Cryptos"); 
    loadCommands(client); 
    loadEvents(client);   
});

client.on("messageCreate", (message) => {
    detectSpam(message); 
});

client.login(client.config.token);