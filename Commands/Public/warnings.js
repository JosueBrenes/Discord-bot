const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { roleIdWarnings } = require("../../config.json");
const fs = require("fs");
const path = require("path");

const WARN_FILE = path.join(__dirname, "../../warns.json");

function loadWarns() {
  let warnsData = {};
  try {
    if (fs.existsSync(WARN_FILE)) {
      const fileData = fs.readFileSync(WARN_FILE, "utf8");
      warnsData = fileData ? JSON.parse(fileData) : {};
    }
  } catch (error) {
    console.error("Error loading the warns.json file:", error);
  }
  return warnsData;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription(
      "Shows the warning list for a user or all users with warnings.",
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to show the warnings for")
        .setRequired(false),
    ),

  async execute(interaction) {
    const requestedUser = interaction.options.getUser("user");
    const requester = interaction.member;

    const requesterRole = requester.roles.cache.find((role) =>
      roleIdWarnings.includes(role.id),
    );
    if (!requesterRole) {
      const noPermsEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Access Denied 🚫")
        .setDescription(
          "You do not have the required rank to execute this command.",
        )
        .setTimestamp()
        .setFooter({
          text: "Covercraft Bot",
          iconURL: "https://example.com/bot-icon.png",
        });
      return interaction.reply({ embeds: [noPermsEmbed], ephemeral: true });
    }

    const warnsData = loadWarns();

    if (requestedUser) {
      const userWarnings = warnsData[requestedUser.id];

      if (!userWarnings || userWarnings.length === 0) {
        const noWarnsEmbed = new EmbedBuilder()
          .setColor("#0000FF")
          .setTitle("No Warnings 🔍")
          .setDescription(
            `The user ${requestedUser.tag} has no recorded warnings.`,
          )
          .setTimestamp()
          .setFooter({
            text: "Covercraft Bot",
            iconURL: "https://example.com/bot-icon.png",
          });
        return interaction.reply({ embeds: [noWarnsEmbed] });
      }

      const warningsList = userWarnings
        .map((warn, index) => {
          return `**#${warn.count}:**\n**Reason:** ${warn.reason}\n**Warned by:** ${warn.warnedBy}\n**Date:** ${warn.date}\n**Time:** ${warn.time}\n`;
        })
        .join("\n");

      const warningsEmbed = new EmbedBuilder()
        .setColor("#0000FF")
        .setTitle(`Warnings for ${requestedUser.tag} 📋`)
        .setDescription(warningsList)
        .setTimestamp()
        .setFooter({
          text: "Covercraft Bot",
          iconURL: "https://example.com/bot-icon.png",
        });

      return interaction.reply({ embeds: [warningsEmbed] });
    } else {
      const allWarningsList = Object.keys(warnsData)
        .map((userId) => {
          const userWarnings = warnsData[userId];
          const userWarningsList = userWarnings
            .map((warn, index) => {
              return `**#${warn.count}:**\n**Reason:** ${warn.reason}\n**Warned by:** ${warn.warnedBy}\n**Date:** ${warn.date}\n**Time:** ${warn.time}\n`;
            })
            .join("\n");

          const nickname =
            userWarnings.length > 0 ? userWarnings[0].nickname : "Unknown";

          return `**User:** ${nickname}\n${userWarningsList}`;
        })
        .join("\n\n");

      if (allWarningsList.length === 0) {
        const noWarnsEmbed = new EmbedBuilder()
          .setColor("#0000FF")
          .setTitle("No Warnings 🔍")
          .setDescription("No warnings are recorded for any user.")
          .setTimestamp()
          .setFooter({
            text: "Covercraft Bot",
            iconURL: "https://example.com/bot-icon.png",
          });
        return interaction.reply({ embeds: [noWarnsEmbed] });
      }

      const allWarningsEmbed = new EmbedBuilder()
        .setColor("#0000FF")
        .setTitle("List of All Warnings 📜")
        .setDescription(allWarningsList)
        .setTimestamp()
        .setFooter({
          text: "Covercraft Bot",
          iconURL: "https://example.com/bot-icon.png",
        });

      return interaction.reply({ embeds: [allWarningsEmbed] });
    }
  },
};
