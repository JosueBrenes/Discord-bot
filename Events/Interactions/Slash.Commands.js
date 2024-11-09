const { ChatInputCommandInteraction } = require("discord.js");
const { roleDevId } = require("../../config.json");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      return interaction.reply({
        content: "This command is outdated.",
        ephemeral: true,
      });
    }

    if (command.developer && interaction.user.id !== roleDevId) {
      return interaction.reply({
        content: "This command is for the Admin only.",
        ephemeral: true,
      });
    }

    command.execute(interaction, client);
  },
};
