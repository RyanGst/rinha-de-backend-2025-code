import { getRedisClient, queueName } from '@repo/redis'
import { Worker, type WorkerOptions } from 'bullmq'
import paymentsJob from '../modules/payments'

const { host, port } = getRedisClient()

const workerOptions: WorkerOptions = {
	connection: { host, port },
	concurrency: Number.parseInt(process.env.CONCURRENCY || '10', 10)
}

export async function bootWorkers() {
	const paymentsWorker = new Worker(queueName.payments, paymentsJob, workerOptions)

	const workers = [paymentsWorker]

	workers.forEach((worker) => {
		worker.on('error', (error) => {
			console.error('Worker error', error)
		})
		worker.on('ready', () => {
			console.log('Worker ready', worker.name)
		})
		worker.on('completed', (a) =>
			console.log(`Worker completed ${worker.name} with id: ${JSON.stringify(a.data.correlationId)}`)
		)
	})
}
