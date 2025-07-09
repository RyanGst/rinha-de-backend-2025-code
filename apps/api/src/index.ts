import { connectToDatabase } from '@repo/db'
import { Elysia } from 'elysia'
import logixlysia from 'logixlysia'
import { config } from './config'
import { payments } from './modules/payments'
import { paymentsSummary } from './modules/payments-summary'
import purgePayments from './modules/purge-payments'

async function bootstrap() {
	await connectToDatabase()

	const app = new Elysia()
		.use(
			logixlysia({
				config: {
					showStartupMessage: true,
					startupMessageFormat: 'simple',
					customLogFormat: '🦊 {now} {level} {duration} {method} {pathname} {status} {message} {ip} {epoch}',
					timestamp: {
						translateTime: 'yyyy-mm-dd HH:MM:ss'
					},
					ip: true
				}
			})
		)
		.use(payments)
		.use(paymentsSummary)
		.use(purgePayments)
		.listen(config.port)

	console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

	return app
}

export const app = await bootstrap()
export type App = typeof app
