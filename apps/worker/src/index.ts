import { bootWorkers } from './config/bootWorkers'
import connectToDatabase from './config/db.ts'

async function main() {
	await connectToDatabase()
	await bootWorkers()
}

main()
