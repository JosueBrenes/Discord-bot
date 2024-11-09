const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { roleIdBan } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for banning the user (optional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user'); 
        const reason = interaction.options.getString('reason') || 'No reason provided'; 

        if (!interaction.member.roles.cache.has(roleIdBan)) {
            const embedNoPermission = new EmbedBuilder()
                .setColor('#FF0000') 
                .setTitle('Permission Denied ❌')
                .setDescription('You do not have the required role to ban members.')
                .setFooter({ text: 'Please contact a moderator if you believe this is a mistake.' })
                .setTimestamp();
            
            return interaction.reply({ embeds: [embedNoPermission], ephemeral: true });
        }

        if (user.bot) {
            const embedBotBan = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Bots Cannot Be Banned ❌')
                .setDescription('You cannot ban a bot.')
                .setTimestamp();

            return interaction.reply({ embeds: [embedBotBan], ephemeral: true });
        }

        if (user.id === interaction.client.user.id) {
            const embedBanSelf = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('You Cannot Ban Me ❌')
                .setDescription('You cannot ban me!')
                .setTimestamp();

            return interaction.reply({ embeds: [embedBanSelf], ephemeral: true });
        }

        if (user.id === interaction.user.id) {
            const embedBanYourself = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('You Cannot Ban Yourself ❌')
                .setDescription('You cannot ban yourself!')
                .setTimestamp();

            return interaction.reply({ embeds: [embedBanYourself], ephemeral: true });
        }

        const embedBanNotification = new EmbedBuilder()
            .setColor('#FF4C4C')
            .setTitle('**You have been banned!** 🚨')
            .setDescription(`**Hello, ${user.tag}!**\n\nYou have been banned from **[Server Name]**.\n\n**Reason:** ${reason}`)
            .setThumbnail(user.displayAvatarURL())
            .setFooter({ text: 'Take care, and see you next time!' })
            .setTimestamp();

        const embedBanConfirmed = new EmbedBuilder()
            .setColor('#FF4C4C')
            .setTitle('**Ban Action Executed** 🚨')
            .setDescription(`**Banned User:** ${user.tag}\n**Reason:** ${reason}\n\n**Action performed by:** ${interaction.user.tag}`)
            .setThumbnail(user.displayAvatarURL())
            .setFooter({ text: 'The server remains safe!' })
            .setTimestamp();

        await user.send({ embeds: [embedBanNotification] }).catch(() => {
            console.log(`Could not send a direct message to ${user.tag}.`);
        });

        try {
            await interaction.guild.members.ban(user, { reason: reason });

            await interaction.reply({ embeds: [embedBanConfirmed] });
        } catch (error) {
            console.error('Error banning the user:', error);

            const embedError = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error Banning User ❌')
                .setDescription('There was an error while trying to ban the user. Please try again.')
                .setTimestamp();

            await interaction.reply({ embeds: [embedError], ephemeral: true });
        }
    }
};
