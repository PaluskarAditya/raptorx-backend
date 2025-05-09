const mongoose = require("mongoose");

const orgSchema = mongoose.Schema({
  rootEmail: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  rootUname: {
    type: String,
    required: true,
  },
  rootPass: {
    type: String,
    required: true,
  },
  distID: {
    type: String,
    required: true,
    unique: true,
  },
});

const Org = mongoose.models.Org || mongoose.model("Org", orgSchema);
module.exports = Org;
