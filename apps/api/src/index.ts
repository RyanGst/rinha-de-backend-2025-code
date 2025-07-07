import { Elysia } from 'elysia'
import {payments} from "./modules/payments";

async function bootstrap() {
	const app = new Elysia().use(payments).listen(3001)

	console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

	return app
}

export const app = await bootstrap()
export type App = typeof app
