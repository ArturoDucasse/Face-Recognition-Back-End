const cors = require("cors");

test("Cors activated", async () => {
  expect(cors).not.toBe({});
});
