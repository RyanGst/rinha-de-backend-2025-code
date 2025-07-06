import { Elysia } from 'elysia'

async function bootstrap() {
	const app = new Elysia().listen(3001)

	console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

	return app
}

export const app = await bootstrap()
export type App = typeof app
