const { loadCommands } = require("../../Handlers/commandHandler");
const { loadPrefixs } = require("../../Handlers/prefixHandler");
const config = require("../../config.json");
const mongoose = require("mongoose");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}`);

        await mongoose.connect(config.mongopass, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        if (mongoose.connection.readyState === 1) {
            console.log("The bot has been connected to the database");
        }

        loadCommands(client);
        loadPrefixs(client);
    },
};
