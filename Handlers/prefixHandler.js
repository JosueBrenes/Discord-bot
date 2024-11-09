async function loadPrefixs(client) {
    const { loadFiles } = require("../Functions/fileLoader");
    const ascii = require("ascii-table");
    const table = new ascii().setHeading("Commands", "Status");

    if (!client.prefixs) {
        client.prefixs = new Map();
    } else {
        client.prefixs.clear();
    }

    try {
        const Files = await loadFiles("CommandsPrefix");

        Files.forEach((file) => {
            const prefixs = require(file);
            client.prefixs.set(prefixs.name, prefixs);
            table.addRow(prefixs.name, "✅");
        });

        console.log(table.toString(), "\nPrefix commands loaded");
    } catch (error) {
        console.error("Error loading prefix commands:", error);
    }
}

module.exports = { loadPrefixs };
