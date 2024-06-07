import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function transactionRoutes(app: FastifyInstance) {
	app.addHook("preHandler", async (req, res) => {
		console.log(`[${req.method}] ${req.url}`);
	});
	app.get(
		"/",
		{
			preHandler: [checkSessionIdExists],
		},
		async (req, res) => {
			const { sessionId } = req.cookies;

			const getAllTransactions = await knex("transactions")
				.select()
				.where("session_id", "=", sessionId);
			return res.status(200).send({ getAllTransactions });
		}
	);

	app.get(
		"/:id",
		{
			preHandler: [checkSessionIdExists],
		},
		async (req, res) => {
			const getTransactionParamSchema = z.object({
				id: z.string().uuid(),
			});

			const { id } = getTransactionParamSchema.parse(req.params);
			const { sessionId } = req.cookies;

			const transaction = await knex("transactions")
				.where({ id, session_id: sessionId })
				.first();

			return res.status(200).send({ transaction });
		}
	);

	app.get(
		"/summary",
		{
			preHandler: [checkSessionIdExists],
		},
		async (req, res) => {
			const { sessionId } = req.cookies;

			const summary = await knex("transactions")
				.where("session_id", "=", sessionId)
				.sum("amount", { as: "amount" })
				.first();
			return { summary };
		}
	);

	app.post("/", async (req, res) => {
		const createTransactionBodySchema = z.object({
			title: z.string(),
			amount: z.number(),
			type: z.enum(["credit", "debit"]),
		});

		const { title, amount, type } = createTransactionBodySchema.parse(req.body);
		if (amount <= 0) {
			return res
				.status(400)
				.send("Transaction failed, the amount value must be higher than 0.");
		}

		let sessionId = req.cookies.sessionId;

		if (!sessionId) {
			sessionId = randomUUID();

			res.cookie("sessionId", sessionId, {
				path: "/",
				maxAge: 60 * 60 * 24 * 5, // 7days
			});
		}

		await knex("transactions").insert({
			id: randomUUID(),
			title,
			amount: type === "credit" ? amount : amount * -1,
			session_id: sessionId,
		});
		return res.status(201).send();
	});
}
