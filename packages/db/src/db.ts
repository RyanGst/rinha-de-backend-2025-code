import mongoose from 'mongoose'

export const connectToDatabase = async () => {
	const uri = process.env.MONGODB_URI!
	await mongoose.connect(uri, {
		family: 4,
		ssl: false
	})

	console.log('Connected to database')
}

export default connectToDatabase
