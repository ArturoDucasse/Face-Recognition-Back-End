/**
 * Returns the current user loged in to the page
 * @param {String} req
 * @param {Json} res
 * @param {Object} db
 */
const profileHandler = (req, res, db) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({ id })
    .then((user) => {
      //If the array is not empty then...
      if (user.length) res.json(user[0]);
      else res.status(400).json("User not found");
    })
    .catch((err) => res.status(400).json("Error getting user", err));
};

module.exports = {
  profileHandler: profileHandler,
};
