import { knex as setupKnex, Knex } from "knex";
import { env } from "./env";

export const config: Knex.Config = {
	client: env.DATABASE_CLIENT,
	useNullAsDefault: true,
	migrations: {
		extension: "ts",
		directory: "./db/migrations",
	},
	connection:
		env.DATABASE_CLIENT === "sqlite"
			? {
					filename: env.DATABASE_URL,
			  }
			: env.DATABASE_URL,
};

export const knex = setupKnex(config);
