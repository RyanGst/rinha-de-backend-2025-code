import mongoose from 'mongoose'

type _PaymentRecord = {
	processor: 'default' | 'fallback'
	requestedAt: Date
	correlationId: string
	amount: number
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
export const PaymentModel = mongoose.model<PaymentRecord>('Payments', paymentSchema)
