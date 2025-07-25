import { Elysia } from 'elysia'
import mongoose from 'mongoose'
import { config } from './config'
import { payments } from './modules/payments'
import { paymentsSummary } from './modules/payments-summary'
import purgePayments from './modules/purge-payments'

async function bootstrap() {
	await mongoose
		.connect(process.env.MONGODB_URI!, {
			maxPoolSize: 30,
			minPoolSize: 5,
			keepAliveInitialDelay: 300_000,
			socketTimeoutMS: 30_000,
			serverSelectionTimeoutMS: 5_000
		})
		.then(() => {
			console.log('Connected to database')
		})

	const app = new Elysia().use(payments).use(paymentsSummary).use(purgePayments).listen(config.port)

	console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

	return app
}

export const app = await bootstrap()
export type App = typeof app
