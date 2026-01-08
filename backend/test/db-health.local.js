const request = require("supertest");
const app = require("../src/app");

describe("Database health check", () => {
    test("GET /db-health returns DB connected", async () => {
        const res = await request(app).get("/db-health");
        expect(res.statusCode).toBe(200);
        expect(res.body.db).toBe("connected");
    });
});
