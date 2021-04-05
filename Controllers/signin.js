/**
 * Compare credentials provided in the front-end with the data in the database
 * @param {String} req
 * @param {Json} res
 * @param {Object} db
 * @param {String} bcrypt
 */
const signinHandler = (req, res, db, bcrypt) => {
  db.select("email", "hash")
    .from("login")
    .where("email", "=", req.body.email)
    //Selecting the email and hash value from user that email is equal to request email
    .then((data) => {
      bcrypt.compare(req.body.password, data[0].hash, function (err, result) {
        if (result) {
          return db
            .select("*")
            .from("users")
            .where("email", "=", req.body.email)
            .then((user) => {
              res.json(user[0]);
            })
            .catch((err) => res.status(400).json("Imposible to get user"));
        }
        res.status(400).json("Wrong sign in information");
      });
    })
    .catch((err) => res.status(400).json("Wrong sign in information"));
};

module.exports = {
  signinHandler: signinHandler,
};
