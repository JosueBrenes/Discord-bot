const { Collection } = require("discord.js");
const { loadFiles } = require("../Functions/fileLoader");
const ascii = require("ascii-table");

async function loadCommands(client) {
    const table = new ascii().setHeading("Commands", "Status");

    try {
        if (!client.commands) {
            client.commands = new Collection();
        } else {
            client.commands.clear();
        }

        let commandsArray = [];
        const Files = await loadFiles("Commands");

        for (const file of Files) {
            try {
                const command = require(file);

                if (!command.data || !command.data.name) {
                    console.error(`Error: Missing 'data' or 'name' property in command: ${file}`);
                    table.addRow(file, "🟥");
                    continue;
                }

                client.commands.set(command.data.name, command);
                commandsArray.push(command.data.toJSON());
                table.addRow(command.data.name, "🟩");
            } catch (error) {
                console.error(`Error loading command from file: ${file}`, error);
                table.addRow(file, "🟥");
            }
        }

        if (client.application) {
            try {
                await client.application.commands.set(commandsArray);
                console.log(table.toString(), "\nCommands Loaded.");
            } catch (error) {
                console.error("Error setting commands in the application:", error);
            }
        } else {
            console.error("client.application is null or undefined.");
        }
    } catch (error) {
        console.error("Error loading commands:", error);
    }
}

module.exports = { loadCommands };
