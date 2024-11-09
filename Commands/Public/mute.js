const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { roleIdMute } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user for a specified time (isolating them from text and voice channels)')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to mute')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('time')
                .setDescription('The time duration to mute (e.g., 10m for 10 minutes, 2h for 2 hours)')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for muting the user (optional)')
                .setRequired(false)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser('user');
        const time = interaction.options.getString('time');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!interaction.member.roles.cache.has(roleIdMute)) {
            const embedNoPermission = new EmbedBuilder()
                .setColor('#FF0000') 
                .setTitle('Permission Denied ❌')
                .setDescription('You do not have the required role to mute members.')
                .setFooter({ text: 'Please contact a moderator if you believe this is a mistake.' })
                .setTimestamp();
            
            return interaction.reply({ embeds: [embedNoPermission], ephemeral: true });
        }

        // Parse time
        let timeInMs;
        const timeMatch = time.match(/^(\d+)(m|h)$/);
        if (!timeMatch) {
            const embedInvalidTime = new EmbedBuilder()
                .setColor('#FF0000') 
                .setTitle('Invalid Time Format ❌')
                .setDescription('Invalid time format. Use the format like `10m` for 10 minutes or `2h` for 2 hours.')
                .setFooter({ text: 'Example: `10m` or `2h`.' })
                .setTimestamp();
            
            return interaction.reply({ embeds: [embedInvalidTime], ephemeral: true });
        }

        const amount = parseInt(timeMatch[1], 10);
        const unit = timeMatch[2];

        if (unit === 'm') {
            timeInMs = amount * 60 * 1000;
        } else if (unit === 'h') {
            timeInMs = amount * 60 * 60 * 1000; 
        }

        if (user.bot) {
            const embedBotMute = new EmbedBuilder()
                .setColor('#FF0000') 
                .setTitle('Bots Cannot Be Muted ❌')
                .setDescription('You cannot mute a bot.')
                .setTimestamp();

            return interaction.reply({ embeds: [embedBotMute], ephemeral: true });
        }

        if (user.id === interaction.client.user.id) {
            const embedMuteSelf = new EmbedBuilder()
                .setColor('#FF0000') 
                .setTitle('You Cannot Mute Me ❌')
                .setDescription('You cannot mute me!')
                .setTimestamp();

            return interaction.reply({ embeds: [embedMuteSelf], ephemeral: true });
        }

        if (user.id === interaction.user.id) {
            const embedMuteYourself = new EmbedBuilder()
                .setColor('#FF0000') 
                .setTitle('You Cannot Mute Yourself ❌')
                .setDescription('You cannot mute yourself!')
                .setTimestamp();

            return interaction.reply({ embeds: [embedMuteYourself], ephemeral: true });
        }

        const muteIsolatedRole = interaction.guild.roles.cache.get('1304479815822217418');
        if (!muteIsolatedRole) {
            const embedRoleNotFound = new EmbedBuilder()
                .setColor('#FF0000') 
                .setTitle('Role Not Found ❌')
                .setDescription('The "Muted and Isolated" role could not be found. Please ensure it exists.')
                .setTimestamp();

            return interaction.reply({ embeds: [embedRoleNotFound], ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(user.id);
        await member.roles.add(muteIsolatedRole);

        const embedMuteNotification = new EmbedBuilder()
            .setColor('#FF0000') 
            .setTitle('**You have been isolated!** 🔇')
            .setDescription(`**Hello, ${user.tag}!**\n\nYou have been isolated from all voice and text channels in **[Server Name]**.\n\n**Reason:** ${reason}\n**Duration:** ${time}`)
            .setThumbnail(user.displayAvatarURL())
            .setFooter({ text: 'Please be respectful and follow the rules!' })
            .setTimestamp();

        const embedMuteConfirmed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('**User Isolated** 🔇')
            .setDescription(`**Muted User:** ${user.tag}\n**Reason:** ${reason}\n**Duration:** ${time}\n\n**Action performed by:** ${interaction.user.tag}`)
            .setThumbnail(user.displayAvatarURL())
            .setFooter({ text: 'Server rules must be followed!' })
            .setTimestamp();

        await user.send({ embeds: [embedMuteNotification] }).catch(() => {
            console.log(`Could not send a direct message to ${user.tag}.`);
        });

        await interaction.reply({ embeds: [embedMuteConfirmed] });

        setTimeout(async () => {
            await member.roles.remove(muteIsolatedRole);

            const embedUnmute = new EmbedBuilder()
                .setColor('#00FF00') 
                .setTitle('**User Un-Isolated** 🔊')
                .setDescription(`**User:** ${user.tag} is no longer isolated from text and voice channels.\n\n**Duration:** ${time}`)
                .setFooter({ text: 'We hope everything is fine now!' })
                .setTimestamp();

            await interaction.followUp({ embeds: [embedUnmute] });
        }, timeInMs);
    }
};
