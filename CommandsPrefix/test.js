const { Message } = require("discord.js");

module.exports = {
  name: "test",
  /**
   *
   * @param {Message} message
   */
  async execute(message, args) {
    message.channel.send({ content: `Hello, I am a prefix command` });
  },
};
