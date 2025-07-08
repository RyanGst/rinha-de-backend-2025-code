import { PaymentsSummary } from './model'

const paymentsSummaryService = {
	async getPaymentsSummary({
		from,
		to
	}: PaymentsSummary.paymentQuery): Promise<PaymentsSummary.paymentSummaryResponse> {
		const returnMock = true
		if (!from || !to || returnMock) {
			return {
				default: { totalRequests: 0, totalAmount: 0 },
				fallback: { totalRequests: 0, totalAmount: 0 }
			}
		}

		const fromDate = new Date(from)
		const toDate = new Date(to)
		const now = new Date()

		if (toDate > now) {
			toDate.setTime(now.getTime())
		}

		const minDate = new Date()
		minDate.setFullYear(now.getFullYear() - 10)

		if (fromDate < minDate) {
			fromDate.setTime(minDate.getTime())
		}


		const pipeline = [
			{
				$match: {
					requestedAt: {
						$gte: fromDate,
						$lte: toDate
					}
				}
			},
			{
				$group: {
					_id: '$processor',
					totalRequests: { $sum: 1 },
					totalAmount: { $sum: '$amount' }
				}
			}
		]

		// Diagnostic: Check if index is being used
		const explainResult = await PaymentsSummary.PaymentModel.aggregate(pipeline).explain('executionStats')
		console.log('Aggregation execution stats:', JSON.stringify(explainResult, null, 2))

		const results = await PaymentsSummary.PaymentModel.aggregate(pipeline, {
			maxTimeMS: 30000, // 30 second timeout
			allowDiskUse: true // Allow disk usage for large aggregations
		})

		const summary = {
			default: { totalRequests: 0, totalAmount: 0 },
			fallback: { totalRequests: 0, totalAmount: 0 }
		}

		for (const { _id, totalRequests, totalAmount } of results) {
			if (_id === 'default' || _id === 'fallback') {
				// @ts-ignore
				summary[_id] = { totalRequests, totalAmount }
			}
		}

		return summary
	}
}

export default paymentsSummaryService
