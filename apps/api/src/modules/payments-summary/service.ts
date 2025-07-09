import { PaymentModel } from '@repo/db'
import { getRedisClient } from '@repo/redis'
import type { PaymentsSummary } from './model'

const { client } = getRedisClient()

const SUMMARY_CACHE_TTL = 1

interface SummaryResult {
	default: { totalRequests: number; totalAmount: number }
	fallback: { totalRequests: number; totalAmount: number }
}

export async function clearCache({ from, to }: { from?: string; to?: string } = {}) {
	if (from && to) {
		const { fromDate, toDate } = fixDateRange(from, to)
		const cacheKey = `payments_summary:${fromDate.toISOString()}:${toDate.toISOString()}`
		await client.del(cacheKey)
	} else {
		// Clear all summary cache
		const keys = await client.keys('payments_summary:*')
		if (keys.length > 0) {
			await client.del(...keys)
		}
	}
}

function fixDateRange(from: string, to: string) {
	const now = new Date()
	let fromDate = new Date(from)
	let toDate = new Date(to)

	if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
		throw new Error('Invalid date format')
	}

	if (toDate > now) {
		toDate = new Date(now)
	}

	const minDate = new Date()
	minDate.setFullYear(now.getFullYear() - 10)

	if (fromDate < minDate) {
		fromDate = new Date(minDate)
	}

	if (fromDate > toDate) {
		fromDate = new Date(toDate)
	}

	return { fromDate, toDate }
}

const paymentsSummaryService = {
	async getPaymentsSummary({
		from,
		to
	}: PaymentsSummary.paymentQuery): Promise<PaymentsSummary.paymentSummaryResponse> {
		const now = new Date()
		const defaultFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000)

		const fromDate = from ? new Date(from) : defaultFrom
		const toDate = to ? new Date(to) : now

		const { fromDate: normalizedFrom, toDate: normalizedTo } = fixDateRange(
			fromDate.toISOString(),
			toDate.toISOString()
		)

		// Generate cache key based on date range
		const cacheKey = `payments_summary:${normalizedFrom.toISOString()}:${normalizedTo.toISOString()}`

		// Try to get from cache first
		const cached = await client.get(cacheKey)
		if (cached) {
			return JSON.parse(cached) as SummaryResult
		}

		// Build optimized aggregation pipeline
		const pipeline = [
			{
				$match: {
					requestedAt: {
						$gte: normalizedFrom,
						$lte: normalizedTo
					},
					processor: { $in: ['default', 'fallback'] } // Only include valid processors
				}
			},
			{
				$group: {
					_id: '$processor',
					totalRequests: { $sum: 1 },
					totalAmount: { $sum: { $toDouble: '$amount' } } // Ensure proper decimal handling
				}
			},
			{
				$sort: { _id: 1 } // Consistent ordering
			}
		]

		try {
			// @ts-ignore
			const results = await PaymentModel.aggregate(pipeline, {
				maxTimeMS: 5000, // Reduced timeout for better performance
				allowDiskUse: false, // Avoid disk usage for better performance
				hint: { requestedAt: 1, processor: 1 } // Force index usage
			})

			// Build result with defaults
			const summary: SummaryResult = {
				default: { totalRequests: 0, totalAmount: 0 },
				fallback: { totalRequests: 0, totalAmount: 0 }
			}

			// Map results to summary
			for (const { _id, totalRequests, totalAmount } of results) {
				if (_id === 'default' || _id === 'fallback') {
					summary[_id as keyof SummaryResult] = {
						totalRequests: Number(totalRequests),
						totalAmount: Number(totalAmount)
					}
				}
			}

			// Cache the result
			await client.set(cacheKey, JSON.stringify(summary), 'EX', SUMMARY_CACHE_TTL)

			return summary
		} catch (error) {
			console.error('Error in payments summary aggregation:', error)

			// Return empty summary on error
			return {
				default: { totalRequests: 0, totalAmount: 0 },
				fallback: { totalRequests: 0, totalAmount: 0 }
			}
		}
	},
	clearCache
}

export default paymentsSummaryService
