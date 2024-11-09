const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { roleIdWarn } = require("../../config.json");
const fs = require("fs");
const path = require("path");

const WARN_FILE = path.join(__dirname, "../../warns.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a user with a reason")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to warn")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the warning")
        .setRequired(false),
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: "You cannot warn yourself.",
        ephemeral: true,
      });
    }

    const member = interaction.guild.members.cache.get(user.id);

    if (user.bot) {
      return interaction.reply({
        content: "You cannot warn a bot.",
        ephemeral: true,
      });
    }

    if (!interaction.member.roles.cache.has(roleIdWarn)) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
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

    if (!warns[userId]) {
      warns[userId] = [];
    }

    const warnData = {
      count: warns[userId].length + 1,
      warnedBy: interaction.user.tag,
      reason: reason,
      nickname: user.username,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    warns[userId].push(warnData);

    try {
      fs.writeFileSync(WARN_FILE, JSON.stringify(warns, null, 2));
    } catch (error) {
      console.error("Error saving warns.json:", error);
      return interaction.reply({
        content:
          "There was an error saving the warning. Please try again later.",
        ephemeral: true,
      });
    }

    const replyEmbed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("Warning Registered! 🎉")
      .setDescription(`The user **${user.tag}** has been successfully warned.`)
      .addFields(
        { name: "Reason", value: `\`\`\`${reason}\`\`\``, inline: false },
        { name: "Warned By", value: interaction.user.tag, inline: true },
        { name: "Date", value: new Date().toLocaleDateString(), inline: true },
        { name: "Time", value: new Date().toLocaleTimeString(), inline: true },
      )
      .setFooter({ text: `Action taken by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [replyEmbed] });

    user
      .send({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("You Have Been Warned ⚠️")
            .setDescription(
              `You have received a warning in **${interaction.guild.name}**.`,
            )
            .addFields(
              { name: "Reason", value: `\`\`\`${reason}\`\`\``, inline: false },
              { name: "Warned By", value: interaction.user.tag, inline: true },
              {
                name: "Date",
                value: new Date().toLocaleDateString(),
                inline: true,
              },
              {
                name: "Time",
                value: new Date().toLocaleTimeString(),
                inline: true,
              },
            )
            .setFooter({ text: "Please follow and respect the rules." })
            .setTimestamp(),
        ],
      })
      .catch((err) => console.error("Could not send DM to the user:", err));
  },
};
