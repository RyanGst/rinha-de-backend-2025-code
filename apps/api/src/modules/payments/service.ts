import type { Payments } from './model'
import { paymentsQueue } from './paymentsQueue'

const paymentsService = {
	async dispatchPayment(payment: Payments.paymentBody) {
		await paymentsQueue.add('process-payment', payment, {
			attempts: 3,
			backoff: {
				type: 'exponential',
				delay: 2000
			}
		})
	}
}

export default paymentsService
