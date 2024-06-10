import {
	expect,
	test,
	beforeAll,
	afterAll,
	it,
	describe,
	beforeEach,
} from "vitest";
import { app } from "../src/app";
import request from "supertest";
import { execSync } from "node:child_process";

beforeAll(async () => {
	await app.ready();
});

afterAll(async () => {
	await app.close();
});

const bodyCreditTransaction = {
	title: "Credit Test Transaction",
	amount: 1000,
	type: "credit",
};

const bodyDebitTransaction = {
	title: "Debit Test Transaction",
	amount: 250,
	type: "debit",
};

beforeEach(() => {
	execSync("npm run knex migrate:rollback --all");
	execSync("npm run knex migrate:latest");
});

describe("Transactions routes tests", () => {
	it("It should be able to create a new transaction", async () => {
		await request(app.server)
			.post("/transactions")
			.send(bodyCreditTransaction)
			.expect(201);
	});

	it("It should be able to list all transactions", async () => {
		const createTransactionResponse = await request(app.server)
			.post("/transactions")
			.send(bodyCreditTransaction);
		const cookie = createTransactionResponse.get("Set-Cookie");
		if (cookie) {
			const getListTransactionsResponse = await request(app.server)
				.get("/transactions")
				.set("Cookie", cookie)
				.expect(200);

			expect(getListTransactionsResponse.body.getAllTransactions).toEqual([
				expect.objectContaining({
					title: bodyCreditTransaction.title,
					amount: bodyCreditTransaction.amount,
				}),
			]);
		}
	});

	it("It should be able to list a especific transaction", async () => {
		const createTransactionResponse = await request(app.server)
			.post("/transactions")
			.send(bodyCreditTransaction);
		const cookie = createTransactionResponse.get("Set-Cookie");
		if (cookie) {
			const getTransactionsList = await request(app.server)
				.get("/transactions")
				.set("Cookie", cookie);
			const { id } = getTransactionsList.body.getAllTransactions[0];
			const getTransactionById = await request(app.server)
				.get(`/transactions/${id}`)
				.set("Cookie", cookie)
				.expect(200);
			expect(getTransactionById.body.transaction).toEqual(
				expect.objectContaining({
					title: bodyCreditTransaction.title,
					amount: bodyCreditTransaction.amount,
				})
			);
		}
	});

	it.only("It should list account summary / balance", async () => {
		const createTransactionResponse = await request(app.server)
			.post("/transactions")
			.send(bodyCreditTransaction);
		const cookie = createTransactionResponse.get("Set-Cookie");

		if (cookie) {
			await request(app.server)
				.post("/transactions")
				.set("Cookie", cookie)
				.send(bodyDebitTransaction);
			const getSummaryResponse = await request(app.server)
				.get("/transactions/summary")
				.set("Cookie", cookie)
				.expect(200);
			console.log(getSummaryResponse.body);
			expect(getSummaryResponse.body).toEqual(
				expect.objectContaining({
					summary: { amount: 750 },
				})
			);
		}
	});
});
