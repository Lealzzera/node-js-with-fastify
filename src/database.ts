import { knex as setupKnex, Knex } from "knex";
import { env } from "./env";

export const config: Knex.Config = {
	client: env.DATABASE_CLIENT,
	useNullAsDefault: true,
	migrations: {
		extension: "ts",
		directory: "./db/migrations",
	},
	connection: {
		filename: env.DATABASE_URL,
	},
};

export const knex = setupKnex(config);
