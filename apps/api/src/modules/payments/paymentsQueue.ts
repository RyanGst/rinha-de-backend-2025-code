import { getRedisClient, queueName } from '@repo/redis'
import { Queue } from 'bullmq'

const { host, port } = getRedisClient()

export const paymentsQueue = new Queue(queueName.payments, {
	connection: { host, port }
})
