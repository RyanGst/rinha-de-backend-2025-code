import { PaymentModel } from '@repo/db'
import type { Job } from 'bullmq'
import endpoints from '../../config/endpoint'
import type { Payments } from './model'
import service from './service'

const paymentsJob = async (job: Job<Payments.paymentJob>) => {
	console.log('Processing payment', job.data.correlationId)

	const { correlationId, amount } = job.data
	const requestedAt = new Date().toISOString()
	const body = { correlationId, amount, requestedAt, processor: 'default' }

	console.log('PaymentModel', PaymentModel.collection.name)

	try {
		await PaymentModel.create(body)
		console.log('Payment created', body)
	} catch (e) {
		console.log('Error creating payment', e)
	}

	// let processor = 'default'

	// try {
	//     const [defaultHealth, fallbackHealth] = await Promise.all([
	//         service.getHealth('default'),
	//         service.getHealth('fallback')
	//     ])

	//     if (defaultHealth.failing && fallbackHealth.failing) {
	//         await job.changeDelay(10000)
	//     }

	//     processor = defaultHealth.failing ? 'fallback' : 'default'

	//     await fetch(endpoints.payments[defaultHealth.failing ? 'fallback' : 'default'], {
	//         method: 'POST',
	//         body: JSON.stringify(body),
	//         headers: {
	//             'Content-Type': 'application/json'
	//         }
	//     })
	// } catch (e) {
	//     console.log(e)
	// } finally {

	//     await PaymentModel.create({
	//         correlationId,
	//         amount,
	//         requestedAt,
	//         processor
	//     })

	// }

	// return {
	//     success: true,
	//     message: 'Payment processed successfully'
	// }
}

export default paymentsJob
