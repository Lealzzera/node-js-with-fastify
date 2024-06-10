import { config } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
	config({ path: ".env.test" });
} else {
	config();
}

const envSchema = z.object({
	DATABASE_URL: z.string(),
	DATABASE_CLIENT: z.string(),
	PORT: z.number().default(3333),
	NODE_ENV: z.enum(["dev", "test", "homolog", "prod"]).default("prod"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
	console.error("Invalid enviroment variables", _env.error.format());
	throw new Error("Invalid Enviroment Variables");
}

export const env = _env.data;
