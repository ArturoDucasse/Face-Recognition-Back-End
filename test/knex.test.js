const knex = require("knex");

test("Knex", async () => {
  expect(knex).not.toBe({});
});
