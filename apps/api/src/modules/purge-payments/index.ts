import { Elysia, StatusMap, status } from 'elysia'

const purgePayments = new Elysia({ prefix: '/purge-payments' }).post('/', async (ctx) => {
	console.log('PURGE PAYMENTS - not implemented')
	return status(StatusMap.OK, 'Purge payments')
})

export default purgePayments
