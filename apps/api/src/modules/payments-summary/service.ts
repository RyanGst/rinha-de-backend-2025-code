import { PaymentsSummary } from "./model"

const paymentsSummaryService = {
    async getPaymentsSummary({from, to}: PaymentsSummary.paymentQuery): Promise<PaymentsSummary.paymentSummaryResponse> {
        if (!from || !to) {
            return {
                default: { totalRequests: 0, totalAmount: 0 },
                fallback: { totalRequests: 0, totalAmount: 0 }
            }
        }

        const pipeline = [
            {
                $match: {
                    requestedAt: {
                        $gte: new Date(from),
                        $lte: new Date(to)
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

        const results = await PaymentsSummary.PaymentModel.aggregate(pipeline)

        const summary = {
            default: { totalRequests: 0, totalAmount: 0 },
            fallback: { totalRequests: 0, totalAmount: 0 }
        }

        for (const {_id, totalRequests, totalAmount} of results) {
            if (_id === 'default' || _id === 'fallback') {
				// @ts-ignore
                summary[_id] = { totalRequests, totalAmount }
            }
        }

        return summary
    }
}

export default paymentsSummaryService