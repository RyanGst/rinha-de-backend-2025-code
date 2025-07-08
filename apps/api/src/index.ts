import { Elysia } from 'elysia'
import { config } from './config'
import connectToDatabase from './db'
import { payments } from './modules/payments'
import { paymentsSummary } from './modules/payments-summary'
import purgePayments from './modules/purge-payments'

async function bootstrap() {
	await connectToDatabase()

	const app = new Elysia().use(payments).use(paymentsSummary).use(purgePayments).listen(config.port)

	console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

	return app
}

export const app = await bootstrap()
export type App = typeof app
