import { Elysia, StatusMap, status } from 'elysia'
import { PaymentsSummary } from './model'
import paymentsSummaryService from './service'

export const paymentsSummary = new Elysia({ prefix: '/payments-summary' }).get(
	'/',
	async (ctx) => {
		const { from, to } = ctx.query
		console.log('GET PAYMENTS SUMMARY', from, to)
		const summary = await paymentsSummaryService.getPaymentsSummary({ from, to })
		return status(StatusMap.OK, summary)
	},
	{
		query: PaymentsSummary.paymentQuery,
		response: {
			200: PaymentsSummary.paymentSummaryResponse
		}
	}
)
