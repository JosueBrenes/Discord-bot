const { Client, MessageEmbed, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { roleIdAdmin } = require('../../config.json');

const mentionCount = {};

module.exports = {
    name: "messageCreate",
    async execute(message, client) {
        const prefix = `¿`;

        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();

        const cmd = client.prefixs.get(command) || client.prefixs.find((cmd) => cmd.aliases && cmd.aliases.includes(command));

        if (!cmd) return;

        try {
            await cmd.execute(message, args);
        } catch (error) {
            console.error("Error executing the command:", error);
        }

        if (!message.mentions.users.size) return;
        const mentionThreshold = 5;

        message.mentions.users.forEach(user => {
            const member = message.guild.members.cache.get(user.id);

            if (member && member.roles.cache.has(roleIdAdmin)) {
                const embedAlert = new MessageEmbed()
                    .setColor('#e74c3c')
                    .setTitle('Attention!')
                    .setDescription(`${member.displayName} has a role that prevents you from bothering them.`);

                message.channel.send({ embeds: [embedAlert] });
            }

            mentionCount[user.id] = (mentionCount[user.id] || 0) + 1;

            if (mentionCount[user.id] === mentionThreshold) {
                const embedAdmin = new MessageEmbed()
                    .setColor('#3498db')
                    .setTitle('Mention Notification')
                    .setDescription(`User ${user.tag} has reached the mention limit of ${mentionThreshold}.`);

                const adminMembers = message.guild.members.cache.filter(member => member.roles.cache.has(roleIdAdmin));
                adminMembers.forEach(adminMember => {
                    adminMember.send({ embeds: [embedAdmin] });
                });

                mentionCount[user.id] = 0;
            }
        });

        if (!message.guild || message.author.bot) return;
        if (message.content.includes("@here") || message.content.includes("@everyone")) return;
        if (!message.content.includes(client.user.id)) return;

        if (message.replied) return;

        message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor("Red")
                    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setDescription("Yes, it's me **Isidoro God**. Happy to help you! Type `/help` or `t-help` to see the available commands and the various ways I can assist you. Also, remember to vote for the bot by clicking the vote button.")
                    .setThumbnail(client.user.displayAvatarURL())
                    .setFooter({ text: "I'm here to assist" })
                    .setTimestamp()
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setURL("https://www.youtube.com/watch?v=6WWxHF5IL_A")
                        .setLabel("Support"),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setURL("https://www.youtube.com/watch?v=6WWxHF5IL_A")
                        .setLabel("Vote")
                )
            ]
        });

        message.replied = true;
    }
};
