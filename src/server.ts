import { app } from "./app";
import { env } from "./env";

app.listen({ port: env.PORT }).then(() => {
	console.info("HTTP SERVER RUNNING!", env.PORT);
});
