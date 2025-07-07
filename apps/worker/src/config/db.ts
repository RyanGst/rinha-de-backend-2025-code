import { MongoClient } from "mongodb";

let client: MongoClient | null = null   

const connectToDatabase = async () => {
    if (client) return client

    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017')
    await client.connect()
    
    return client.db(process.env.MONGO_DB || 'rinha-ryangst')
}

export default connectToDatabase