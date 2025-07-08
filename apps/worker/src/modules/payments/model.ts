import { Type as t } from '@sinclair/typebox'
import * as mongoose from 'mongoose'

export namespace Payments {
	export const paymentJob = t.Object({
		correlationId: t.String(),
		amount: t.Number()
	})

	export type paymentJob = typeof paymentJob.static

	type _PaymentRecord = paymentJob & {
		processor: 'default' | 'fallback'
		requestedAt: Date
	}

	const paymentSchema = new mongoose.Schema<_PaymentRecord>({
		correlationId: { type: String, required: true },
		amount: { type: Number, required: true },
		requestedAt: { type: Date, required: true },
		processor: { type: String, required: true }
	})

	export type PaymentRecord = mongoose.InferSchemaType<typeof paymentSchema>
	export const PaymentModel = mongoose.model<PaymentRecord>('Payment', paymentSchema)
}
