const autorolschema = require("../../Schemas/autorolschema");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    const data = await autorolschema.findOne({ serverId: member.guild.id });
    if (!data) return;

    const roleIds = [
      data.roleId1,
      data.roleId2,
      data.roleId3,
      data.roleId4,
      data.roleId5,
    ]
      .filter((role) => !!role)
      .map((role) => role.match(/\d+/)[0]);

    if (roleIds.length > 0) {
      try {
        const rolesToAdd = roleIds.map((roleId) =>
          member.guild.roles.cache.get(roleId),
        );
        await member.roles.add(rolesToAdd);
      } catch (error) {
        console.error(":x: Error while adding roles:", error);
      }
    }
  },
};
