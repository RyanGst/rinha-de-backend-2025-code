import mongoose from 'mongoose'
import { bootWorkers } from './config/bootWorkers'

async function main() {
	await mongoose
		.connect(process.env.MONGODB_URI!, {
			maxPoolSize: 30,
			minPoolSize: 5,
			keepAliveInitialDelay: 300_000,
			socketTimeoutMS: 30_000,
			serverSelectionTimeoutMS: 5_000
		})
		.then(() => {
			console.log('Connected to database')
		})

	await bootWorkers()
}

main()
