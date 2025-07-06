import { RedisClient } from 'bun'
import type { RedisConnection } from './RedisConnection.ts'

export function getRedisClient(
	{ url, options }: RedisConnection = {
		url: process.env.REDIS_URL!,
		options: {}
	}
) {
	const redisUrl = new URL(url)

	const client = new RedisClient(redisUrl.toString(), options)

	const host = redisUrl.hostname
	const port = Number.parseInt(redisUrl.port, 10)

	return {
		client,
		host,
		port
	}
}
