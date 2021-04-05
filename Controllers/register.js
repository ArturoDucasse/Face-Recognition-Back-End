/**
 * Register the passed data into the database
 * @param {String} req
 * @param {Json} res
 * @param {Object} db
 * @param {String} bcrypt
 */
const registerHandler = (req, res, db, bcrypt) => {
  //Destructuring values expected from the body
  const { email, name, password } = req.body;
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, function (err, hash) {
    // Store hash in your password DB.
    db.transaction((trx) => {
      trx
        .insert({
          hash: hash,
          email: email,
        })
        .into("login")
        .returning("email")
        .then((loginEmail) => {
          return trx("users")
            .returning("*")
            .insert({
              email: loginEmail[0],
              name: name,
              joined: new Date(),
            })
            .then((user) => {
              res.json(user[0]);
            });
        })
        .then(trx.commit)
        .catch(trx.rollback);
    }).catch((err) => res.status(400).json("Unable to deliver" + err));
  });
};

module.exports = {
  registerHandler: registerHandler,
};
