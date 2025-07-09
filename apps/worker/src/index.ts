import { connectToDatabase } from '@repo/db'
import mongoose from 'mongoose'
import { bootWorkers } from './config/bootWorkers'

async function main() {
	await connectToDatabase()
	const registeredModels = mongoose.modelNames()
	console.log('Models:', registeredModels)
	await bootWorkers()
}

main()
