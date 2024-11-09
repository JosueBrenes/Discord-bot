const { model, Schema } = require('mongoose');

let autorolschema = new Schema({
    serverId: String,
    roleId1: String,
    roleId2: String,
    roleId3: String,
    roleId4: String,
    roleId5: String,
});

module.exports = model('autorolschema', autorolschema);