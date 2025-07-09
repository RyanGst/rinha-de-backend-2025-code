import { getRedisClient } from '@repo/redis'
import endpoints from '../../config/endpoint'

const { client } = getRedisClient()

const HEALTH_CHECK_RATE_LIMIT = 5000
const HEALTH_CACHE_TTL = 4

interface HealthStatus {
	failing: boolean
	minResponseTime: number
}

interface CachedHealth {
	status: HealthStatus
	timestamp: number
}

async function getHealth(processor: 'default' | 'fallback'): Promise<HealthStatus> {
	const cacheKey = `health:${processor}`
	const rateLimitKey = `health_rate_limit:${processor}`

	try {
		const rateLimit = await client.get(rateLimitKey)
		if (rateLimit) {
			const lastCall = parseInt(rateLimit)
			const timeSinceLastCall = Date.now() - lastCall

			if (timeSinceLastCall < HEALTH_CHECK_RATE_LIMIT) {
				// Return cached result if available
				const cached = await client.get(cacheKey)
				if (cached) {
					const parsed: CachedHealth = JSON.parse(cached)
					return parsed.status
				}

				// If no cache, wait for rate limit
				const waitTime = HEALTH_CHECK_RATE_LIMIT - timeSinceLastCall
				await new Promise((resolve) => setTimeout(resolve, waitTime))
			}
		}

		// Set rate limit timestamp
		await client.set(rateLimitKey, Date.now().toString(), 'EX', 10)

		// Make the health check request
		const _startTime = Date.now()
		const response = await fetch(endpoints.health[processor], {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		})

		if (response.status === 429) {
			// Rate limited - use cached data if available
			const cached = await client.get(cacheKey)
			if (cached) {
				const parsed: CachedHealth = JSON.parse(cached)
				console.log(`Rate limited for ${processor}, using cached health data`)
				return parsed.status
			}

			// No cache available, assume failing
			return { failing: true, minResponseTime: Infinity }
		}

		if (!response.ok) {
			throw new Error(`Health check failed: ${response.status}`)
		}

		const data = (await response.json()) as HealthStatus

		// Cache the result
		const cachedHealth: CachedHealth = {
			status: data,
			timestamp: Date.now()
		}
		await client.set(cacheKey, JSON.stringify(cachedHealth), 'EX', HEALTH_CACHE_TTL)

		return data
	} catch (err) {
		console.error(`Health check error for ${processor}:`, err)

		// Try to return cached data on error
		const cached = await client.get(cacheKey)
		if (cached) {
			const parsed: CachedHealth = JSON.parse(cached)
			console.log(`Using cached health data for ${processor} due to error`)
			return parsed.status
		}

		// Default to failing if no cache
		return { failing: true, minResponseTime: Infinity }
	}
}

async function getOptimalProcessor(): Promise<'default' | 'fallback'> {
	const [defaultHealth, fallbackHealth] = await Promise.all([getHealth('default'), getHealth('fallback')])

	// If both are failing, throw error
	if (defaultHealth.failing && fallbackHealth.failing) {
		throw new Error('Both processors are failing')
	}

	// If one is failing, use the other
	if (defaultHealth.failing) return 'fallback'
	if (fallbackHealth.failing) return 'default'

	// If both are healthy, choose the one with better response time
	return defaultHealth.minResponseTime <= fallbackHealth.minResponseTime ? 'default' : 'fallback'
}

async function processPayment(body: { correlationId: string; amount: number; requestedAt: string }) {
	const processor = await getOptimalProcessor()

	const response = await fetch(endpoints.payments[processor], {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json'
		}
	})

	if (!response.ok) {
		throw new Error(`Payment processor ${processor} failed: ${response.status}`)
	}

	return { processor, success: true }
}

// Utility function to get health status for both processors
async function getHealthStatus() {
	const [defaultHealth, fallbackHealth] = await Promise.all([getHealth('default'), getHealth('fallback')])

	return {
		default: defaultHealth,
		fallback: fallbackHealth
	}
}

async function clearHealthCache(processor?: 'default' | 'fallback') {
	if (processor) {
		await client.del(`health:${processor}`)
		await client.del(`health_rate_limit:${processor}`)
	} else {
		await client.del('health:default', 'health:fallback')
		await client.del('health_rate_limit:default', 'health_rate_limit:fallback')
	}
}

const clearCache = async () => {
	const keys = await client.keys('payments_summary:*')
	if (keys.length > 0) {
		await client.del(...keys)
	}
}

const service = {
	getHealth,
	getOptimalProcessor,
	processPayment,
	getHealthStatus,
	clearHealthCache,
	clearCache
}

export default service
