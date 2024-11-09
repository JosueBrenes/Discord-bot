const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const autorolschema = require('../../Schemas/autorolschema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('Set up or delete the auto-role system in your server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Set up the auto-role system in your server.')
                .addRoleOption(option => option.setName('role1').setDescription('Mention the first role to add.').setRequired(true))
                .addRoleOption(option => option.setName('role2').setDescription('Mention the second role to add.').setRequired(false))
                .addRoleOption(option => option.setName('role3').setDescription('Mention the third role to add.').setRequired(false))
                .addRoleOption(option => option.setName('role4').setDescription('Mention the fourth role to add.').setRequired(false))
                .addRoleOption(option => option.setName('role5').setDescription('Mention the fifth role to add.').setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete the auto-role system configured in your server.')
        ),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'setup') {
            return await executeSetup(interaction);
        } else if (interaction.options.getSubcommand() === 'delete') {
            return await executeDelete(interaction);
        }
    },
};

async function executeSetup(interaction) {
    const role1 = interaction.options.getRole('role1');
    const role2 = interaction.options.getRole('role2');
    const role3 = interaction.options.getRole('role3');
    const role4 = interaction.options.getRole('role4');
    const role5 = interaction.options.getRole('role5');

    const data = await autorolschema.findOne({ serverId: interaction.guild.id });

    if (data) {
        const embed = new EmbedBuilder()
            .setDescription(':x: The auto-role system has already been set up...\nDelete the auto-role system first with `/autorole delete` and set it up again.')
            .setColor('Red');

        return await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
        const setupData = {
            serverId: interaction.guild.id,
            roleId1: role1,
            roleId2: role2,
            roleId3: role3,
            roleId4: role4,
            roleId5: role5,
        };

        await autorolschema.create(setupData);

        const embed = new EmbedBuilder()
            .setDescription('Auto-role system configured! ✅')
            .setColor('Green');

        return await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}

async function executeDelete(interaction) {
    const data = await autorolschema.findOne({ serverId: interaction.guild.id });

    if (!data) {
        const embed = new EmbedBuilder()
            .setDescription(':x: The auto-role system is not configured in this server.')
            .setColor('Red');

        return await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
        await autorolschema.deleteOne({ serverId: interaction.guild.id });

        const embed = new EmbedBuilder()
            .setDescription('Auto-role system successfully deleted! ✅')
            .setColor('Green');

        return await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
