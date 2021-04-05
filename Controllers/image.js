const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set("authorization", "Key f9fc9ac54eea4e24b07463b58ea7cd42");

/**
 *Returns the borders location if there's a face in the image
 * @param {String} req
 * @param {Json} res
 * @param {Object} db
 */
const imageHandler = (req, res, db) => {
  const { id, imageUrl } = req.body;
  //This objects holds the inf that will be return to the front end
  let data = {
    entries: "",
    imageBox: {},
  };

  //Getting the data from the clarifai API
  stub.PostModelOutputs(
    {
      // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
      model_id: "d02b4508df58432fbb84e800597b8959",
      inputs: [{ data: { image: { url: imageUrl } } }],
    },
    metadata,
    (err, response) => {
      if (err) {
        res.status(404).json("Error: " + err);
        return;
      }

      if (response.status.code !== 10000) {
        res
          .status(404)
          .json(
            "Received failed status: " +
              response.status.description +
              "\n" +
              response.status.details
          );
        return;
      }

      db("users")
        .where("id", "=", id)
        .increment("entries", 1)
        .returning("entries")
        .then((entries) => {
          data.entries = entries[0];
          data.imageBox =
            response.outputs[0].data.regions[0].region_info.bounding_box;
          if (data.imageBox.left_col) res.json(data);
          else {
            res.json("Error");
          }
        })
        .catch((err) => res.status(400).json("Unable to get entries"));
    }
  );
};

module.exports = {
  imageHandler: imageHandler,
};
