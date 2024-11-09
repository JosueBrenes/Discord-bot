const { model, Schema } = require("mongoose");

let testing = new Schema({
  GuildID: String,
  UserID: String,
});

module.exports = model(`testing`, testing);
