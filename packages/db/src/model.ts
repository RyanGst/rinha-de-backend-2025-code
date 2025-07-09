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

paymentSchema.index(
	{ requestedAt: 1, processor: 1 },
	{
		background: true,
		partialFilterExpression: { processor: { $in: ['default', 'fallback'] } }
	}
)
paymentSchema.index({ correlationId: 1 }, { unique: true })
paymentSchema.index({ processor: 1, requestedAt: 1 }, { background: true })

export type PaymentRecord = mongoose.InferSchemaType<typeof paymentSchema>
export const PaymentModel = mongoose.model<PaymentRecord>('Payments', paymentSchema)
