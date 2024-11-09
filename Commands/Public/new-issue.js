const { SlashCommandBuilder, WebhookClient, EmbedBuilder } = require('discord.js');
const { webhookIssue } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('new-issue')
        .setDescription('Report a new issue')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('The issue link')
                .setRequired(true)
        ),

    async execute(interaction) {
        const issueLink = interaction.options.getString('link');
        const webhookClient = new WebhookClient({ url: webhookIssue });

        const embed = new EmbedBuilder()
            .setColor('#FF5733')
            .setTitle('New Issue Reported ✨')
            .setDescription(`**A new issue has been reported!** 🚨\n\nClick the link below to view it:`)
            .setURL(issueLink)
            .addFields(
                { name: 'Issue Link', value: `[Access the Issue](${issueLink})` },
                { name: 'Reported by', value: `${interaction.user.tag}`, inline: true },
                { name: 'Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Octicons-mark-github.svg/1024px-Octicons-mark-github.svg.png')
            .setImage('https://media.giphy.com/media/8fS4ZZHkDADlM/giphy.gif')
            .setFooter({ text: 'Thanks for maintaining the project!', iconURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' })
            .setTimestamp();

        try {
            await webhookClient.send({
                content: '@everyone',
                embeds: [embed],
            });

            const successEmbed = new EmbedBuilder()
                .setColor('#28A745')
                .setTitle('Issue Reported Successfully ✅')
                .setDescription('Your issue has been successfully reported!')
                .setFooter({ text: `Reported by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        } catch (error) {
            console.error('Error sending the webhook:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error Reporting Issue ❌')
                .setDescription('Something went wrong. Please try again later.')
                .setFooter({ text: `Reported by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
