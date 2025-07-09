import { Elysia, StatusMap, status } from 'elysia'
import { paymentsQueue } from '../payments/paymentsQueue'

const purgePayments = new Elysia({ prefix: '/purge-payments' }).post('/', async (ctx) => {
	await paymentsQueue.obliterate({ force: true })
	return status(StatusMap.OK, 'Purge payments')
})

export default purgePayments
