const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { roleIdcw } = require("../../config.json");
const fs = require("fs");
const path = require("path");

const WARN_FILE = path.join(__dirname, "../../warns.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearwarn")
    .setDescription("Removes the last warning of a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user from whom the last warning will be removed")
        .setRequired(true),
    ),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(roleIdcw)) {
      const embedNoPermission = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Permission Denied ❌")
        .setDescription("You do not have permission to use this command.")
        .setFooter({
          text: "Please contact a moderator if you believe this is a mistake.",
        })
        .setTimestamp();

      return interaction.reply({
        embeds: [embedNoPermission],
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser("user");
    const member = interaction.guild.members.cache.get(user.id);

    if (user.bot) {
      const embedBotError = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("❌ Invalid Action ❌")
        .setDescription("You cannot remove warnings from a bot.")
        .setTimestamp();

      return interaction.reply({ embeds: [embedBotError], ephemeral: true });
    }

    if (user.id === interaction.user.id) {
      const embedSelfError = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Invalid Action ❌")
        .setDescription("You cannot remove your own warning.")
        .setTimestamp();

      return interaction.reply({ embeds: [embedSelfError], ephemeral: true });
    }

    let warns = {};
    try {
      if (fs.existsSync(WARN_FILE)) {
        const data = fs.readFileSync(WARN_FILE, "utf8");
        warns = JSON.parse(data);
      }
    } catch (error) {
      console.error("Error reading or parsing warns.json:", error);
      warns = {};
    }

    const userId = user.id;
    if (!warns[userId] || warns[userId].length === 0) {
      const embedNoWarnings = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("No Warnings Found ❌")
        .setDescription("This user has no warnings to remove.")
        .setTimestamp();

      return interaction.reply({ embeds: [embedNoWarnings], ephemeral: true });
    }

    const removedWarn = warns[userId].pop();
    if (warns[userId].length === 0) {
      delete warns[userId];
    }

    try {
      fs.writeFileSync(WARN_FILE, JSON.stringify(warns, null, 2));
    } catch (error) {
      console.error("Error saving warns.json:", error);

      const embedSaveError = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Error Saving Data ❌")
        .setDescription(
          "There was an error saving the data. Please try again later.",
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embedSaveError], ephemeral: true });
    }

    const successEmbed = new EmbedBuilder()
      .setColor("#007BFF")
      .setTitle("Warning Removed ✅")
      .setDescription(`The last warning of **${user.tag}** has been removed.`)
      .addFields(
        {
          name: "Reason",
          value: `\`\`\`${removedWarn.reason}\`\`\``,
          inline: false,
        },
        { name: "Warned By", value: removedWarn.warnedBy, inline: true },
        { name: "Date", value: removedWarn.date, inline: true },
        { name: "Time", value: removedWarn.time, inline: true },
      )
      .setFooter({ text: `Removed by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [successEmbed] });

    user
      .send({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("Warning Removal Notification 📩")
            .setDescription(
              `A warning has been removed from your history in **${interaction.guild.name}**.`,
            )
            .addFields(
              {
                name: "Reason",
                value: `\`\`\`${removedWarn.reason}\`\`\``,
                inline: false,
              },
              { name: "Warned By", value: removedWarn.warnedBy, inline: true },
              { name: "Date", value: removedWarn.date, inline: true },
              { name: "Time", value: removedWarn.time, inline: true },
            )
            .setFooter({
              text: "This is an automated notice. Please follow the rules and maintain good behavior.",
            })
            .setTimestamp(),
        ],
      })
      .catch((err) => console.error("Could not send DM to the user:", err));
  },
};
