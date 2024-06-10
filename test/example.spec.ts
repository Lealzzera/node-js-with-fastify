import { expect, test, beforeAll, afterAll } from "vitest";
import { app } from "../src/app";
import request from "supertest";

beforeAll(async () => {
	await app.ready();
});

afterAll(async () => {
	await app.close();
});

const bodyCreditTransaction = {
	title: "My test transaction",
	amount: 1000,
	type: "credit",
};

test("It should create a new transaction", async () => {
	await request(app.server)
		.post("/transactions")
		.send(bodyCreditTransaction)
		.expect(201);
});
