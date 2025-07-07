import { getRedisClient, queueName } from "@repo/redis"
import { Queue } from "bullmq"
import { Payments } from "./model"

const { host, port } = getRedisClient()

const paymentsQueue = new Queue(queueName.payments, {
	connection: { host, port }
})

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