import type { Job } from 'bullmq'
import endpoints from '../../config/endpoint'
import { Payments } from './model'
import service from './service'

const paymentsJob = async (job: Job<Payments.paymentJob>) => {
	console.log('Processing payment', job.data)

	const { correlationId, amount } = job.data

	const [defaultHealth, fallbackHealth] = await Promise.all([
		service.getHealth('default'),
		service.getHealth('fallback')
	])

	if (defaultHealth.failing && fallbackHealth.failing) {
		await job.changeDelay(10000)
	}

	const processor = defaultHealth.failing ? 'fallback' : 'default'

	const requestedAt = new Date().toISOString()
	const body = { correlationId, amount, requestedAt }

	const request = new Request(endpoints.payments[processor], {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json'
		}
	})

	await fetch(request)

	await Payments.PaymentModel.create({
		correlationId,
		amount,
		requestedAt,
		processor
	})

	return {
		success: true,
		message: 'Payment processed successfully'
	}
}

export default paymentsJob
