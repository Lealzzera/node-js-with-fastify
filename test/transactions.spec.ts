import { expect, test, beforeAll, afterAll, it } from "vitest";
import { app } from "../src/app";
import request from "supertest";
import { describe } from "node:test";

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

describe("Transactions routes tests", () => {
	it("It should be able to create a new transaction", async () => {
		await request(app.server)
			.post("/transactions")
			.send(bodyCreditTransaction)
			.expect(201);
	});
});
