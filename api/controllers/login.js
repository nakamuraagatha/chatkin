module.exports = {


  friendlyName: 'Login',


  description: 'Login to your account.',


  inputs: {
    username: { type: 'string', required: true },
    password: { type: 'string', required: true }
  },


  exits: {
    notFound: {
      statusCode: 404,
      description: 'The provided username and password combination doesn\'t match any known user.'
    }
  },


  fn: function (inputs, exits, env) {

    var passwords = require('machinepack-passwords');

    // Find the user record with the provided `username`
    User.findOne({
      username: inputs.username
    })
    .exec(function(err, userRecord) {
      if (err) { return exits.error(err); }

      // If there was no matching user, exit thru "notFound".
      if(!userRecord) {
        return exits.notFound();
      }

      // Otherwise, we have a user record,
      // so verify the password that was entered.
      passwords.checkPassword({
        passwordAttempt: inputs.password,
        encryptedPassword: userRecord.password
      })
      .exec({
        error: function(err) { return exits.error(err); },
        incorrect: function () {
          // If the password doesn't match, then also
          // exit thru "notFound" to prevent sniffing.
          return exits.notFound();
        },
        success: function (){

          // Set the user ID in the session.
          env.req.session.userId = userRecord.id;
          return exits.success();

        }//</on success>
      });//</checkPassword().exec()>
    }, exits.error);//</User.findOne().exec()>

  }


};
