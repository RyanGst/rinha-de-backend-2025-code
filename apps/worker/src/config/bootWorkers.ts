import { getRedisClient, queueName } from '@repo/redis'
import { Worker, type WorkerOptions } from 'bullmq'

const { host, port } = getRedisClient()

const workerOptions: WorkerOptions = {
	connection: { host, port },
	concurrency: Number.parseInt(process.env.CONCURRENCY || '1', 10)
}

export async function bootWorkers() {
	const imageProcessingWorker = new Worker(queueName['image-processing'], async () => {}, workerOptions)

	const workers = [imageProcessingWorker]

	workers.forEach((worker) => {
		worker.on('error', (error) => {
			console.error('Worker error', error)
		})
		worker.on('ready', () => {
			console.log('Worker ready', worker.name)
		})
	})
}
