import { t } from 'elysia'
import mongoose from 'mongoose'
import type { Payments } from '../payments/model'

export namespace PaymentsSummary {
	export const paymentQuery = t.Object({
		from: t.String(),
		to: t.String()
	})

	export type paymentQuery = typeof paymentQuery.static

	type _PaymentRecord = Payments.paymentBody & {
		processor: 'default' | 'fallback'
		requestedAt: Date
	}

	const paymentSchema = new mongoose.Schema<_PaymentRecord>({
		correlationId: { type: String, required: true },
		amount: { type: Number, required: true },
		requestedAt: { type: Date, required: true },
		processor: { type: String, required: true }
	})

	// Compound index for aggregation performance
	paymentSchema.index({ requestedAt: 1, processor: 1 })

	export type PaymentRecord = mongoose.InferSchemaType<typeof paymentSchema>
	export const PaymentModel = mongoose.model<PaymentRecord>('Payment', paymentSchema)

	// Ensure indexes are created
	PaymentModel.syncIndexes().catch(console.error)

	/**
     * "default" : {
        "totalRequests": 43236,
        "totalAmount": 415542345.98
    },
    "fallback" : {
        "totalRequests": 423545,
        "totalAmount": 329347.34
    }
     */
	export const paymentSummaryResponse = t.Object({
		default: t.Object({
			totalRequests: t.Number(),
			totalAmount: t.Number()
		}),
		fallback: t.Object({
			totalRequests: t.Number(),
			totalAmount: t.Number()
		})
	})

	export type paymentSummaryResponse = typeof paymentSummaryResponse.static
}
