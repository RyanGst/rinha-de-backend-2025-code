import { Elysia } from 'elysia'
import {payments} from "./modules/payments";
import { config } from './config';

async function bootstrap() {
	const app = new Elysia().use(payments).listen(config.port)

	console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

	return app
}

export const app = await bootstrap()
export type App = typeof app
