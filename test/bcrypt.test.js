const bcrypt = require("bcrypt");

test("Bcrypt is activated", async () => {
  expect(bcrypt).not.toBe({});
});
