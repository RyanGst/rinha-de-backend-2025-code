import mongoose from 'mongoose'
import { bootWorkers } from './config/bootWorkers'

async function main() {
	await mongoose.connect(process.env.MONGODB_URI!)
	await bootWorkers()
}

main()
