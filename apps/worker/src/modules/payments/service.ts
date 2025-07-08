import { getRedisClient } from '@repo/redis'
import endpoints from '../../config/endpoint'

const { client } = getRedisClient()

async function getHealth(processor: 'default' | 'fallback') {
	const now = Date.now()
	const cache = await client.get(`health:${processor}`)

	if (cache) {
		return JSON.parse(cache) as { failing: boolean; minResponseTime: number }
	}

	try {
		const response = await fetch(endpoints.health[processor])
		const data = (await response.json()) as { failing: boolean; minResponseTime: number }

		await client.set(`health:${processor}`, JSON.stringify(data), 'EX', 10)

		return data
	} catch (err) {
		return { failing: true, minResponseTime: Infinity, lastCheck: now }
	}
}

const service = {
	getHealth
}

export default service
