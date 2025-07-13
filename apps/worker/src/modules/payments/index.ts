import { PaymentModel } from '@repo/db'
import type { Job } from 'bullmq'
import type { Payments } from './model'
import service from './service'

const paymentsJob = async (job: Job<Payments.paymentJob>) => {
	const { correlationId, amount } = job.data

	const existingPayment = await PaymentModel.findOne({ correlationId })

	if (existingPayment) {
		return {
			success: true,
			message: 'Payment already processed',
			processor: existingPayment.processor
		}
	}

	try {
		const processedAt = new Date()
		const { processor } = await service.processPayment({
			correlationId,
			amount,
			requestedAt: processedAt.toISOString()
		})

		await PaymentModel.create({
			correlationId,
			amount,
			requestedAt: processedAt,
			processor
		})

		return {
			success: true,
			message: 'Payment processed successfully',
			processor
		}
	} catch (e) {
		if (e instanceof Error) {
			if (e.message === 'Both processors are failing') {
				console.log('Both processors failing, delaying job', correlationId)
				await job.changeDelay(10000)
			}
		}
		throw e
	} finally {
		await service.clearCache()
	}
}

export default paymentsJob
