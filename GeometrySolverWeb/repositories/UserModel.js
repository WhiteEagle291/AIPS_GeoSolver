const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:String,
  myProjects:{
    type:[{
      projectid:String
  }]
  }
},{ versionKey: false });

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;