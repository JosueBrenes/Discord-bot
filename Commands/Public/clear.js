const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { roleIdclear } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear a specified number of messages from the channel')
        .addIntegerOption(option => 
            option.setName('quantity')
                .setDescription('The number of messages to clear (max 100)')
                .setRequired(true)
        ),

    async execute(interaction) {
        const quantity = interaction.options.getInteger('quantity');

        if (!interaction.member.roles.cache.has(roleIdclear)) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('You do not have permission to use this command')
                .setDescription('You need the required role to use the /clear command.')
                .setTimestamp();
            return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
        }

        if (quantity > 100) {
            const limitExceededEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Cannot delete more than 100 messages at once')
                .setDescription('You cannot delete more than 100 messages at once due to Discord API limitations.')
                .setTimestamp();
            return interaction.reply({ embeds: [limitExceededEmbed], ephemeral: true });
        }

        if (quantity <= 0) {
            const invalidQuantityEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Invalid quantity')
                .setDescription('Please provide a valid number of messages to delete (greater than 0).')
                .setTimestamp();
            return interaction.reply({ embeds: [invalidQuantityEmbed], ephemeral: true });
        }

        try {
            const messages = await interaction.channel.messages.fetch({ limit: Math.min(quantity, 100) });
            await interaction.channel.bulkDelete(messages, true); 

            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Messages deleted successfully ✅')
                .setDescription(`Successfully deleted ${quantity} messages.`)
                .setTimestamp();

            const replyMessage = await interaction.reply({ embeds: [successEmbed] });

            setTimeout(() => {
                replyMessage.delete();
            }, 1000);

        } catch (error) {
            console.error('Error while deleting messages:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error deleting messages ❌')
                .setDescription('There was an error while trying to delete messages.')
                .setTimestamp();
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
