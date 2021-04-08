const knex = require("knex");
const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  },
});

test("Data base is on", async () => {
  expect(db).not.toBe({});
});
