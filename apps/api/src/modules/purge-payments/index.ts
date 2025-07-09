import { PaymentModel } from '@repo/db'
import { Elysia, StatusMap, status } from 'elysia'
import { paymentsQueue } from '../payments/paymentsQueue'
import paymentsSummaryService from '../payments-summary/service'

const purgePayments = new Elysia({ prefix: '/purge-payments' }).post('/', async (_ctx) => {
	await paymentsQueue.obliterate({ force: true })
	await PaymentModel.deleteMany({})
	await paymentsSummaryService.clearCache()
	return status(StatusMap.OK, 'Purge payments')
})

export default purgePayments
