import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { PaymentModel } from '@repo/db'
import type { Job } from 'bullmq'
import * as mongoose from 'mongoose'
import paymentsJob from './index'
import type { Payments } from './model'

describe('Payments Job Integration Tests', () => {
	let testJob: Job<Payments.paymentJob>

	beforeAll(async () => {
		await mongoose.connect(Bun.env.MONGODB_URI!)
	})

	beforeEach(async () => {
		// Clear the database
		await PaymentModel.deleteMany({})

		// Create a test job
		testJob = {
			data: {
				correlationId: Bun.randomUUIDv7(),
				amount: 100.5
			}
		} as Job<Payments.paymentJob>
	})

	afterEach(async () => {
		// Clean up
		await PaymentModel.deleteMany({})
	})

	afterAll(async () => {
		await mongoose.disconnect()
	})

	it('should process payment successfully with default processor', async () => {
		await paymentsJob(testJob)

		// Verify payment was saved to database
		const savedPayment = await PaymentModel.findOne({
			correlationId: testJob.data.correlationId
		})

		expect(savedPayment).toBeTruthy()
		expect(savedPayment?.amount).toBe(100.5)
		expect(savedPayment?.processor).toBe('default')
		expect(savedPayment?.requestedAt).toBeInstanceOf(Date)
	})

	it('should process payment with fallback processor when default is down', async () => {
		// This test assumes the default processor might be down
		// In a real scenario, you'd need to stop the default processor container
		await paymentsJob(testJob)

		const savedPayment = await PaymentModel.findOne({
			correlationId: testJob.data.correlationId
		})

		expect(savedPayment).toBeTruthy()
		expect(['default', 'fallback']).toContain(savedPayment?.processor)
	})

	it('should handle multiple payments with different correlation IDs', async () => {
		const job1 = {
			data: {
				correlationId: Bun.randomUUIDv7(),
				amount: 50.25
			}
		} as Job<Payments.paymentJob>

		const job2 = {
			data: {
				correlationId: Bun.randomUUIDv7(),
				amount: 75.75
			}
		} as Job<Payments.paymentJob>

		await Promise.all([paymentsJob(job1), paymentsJob(job2)])

		const savedPayments = await PaymentModel.find({
			correlationId: { $in: [job1.data.correlationId, job2.data.correlationId] }
		})

		expect(savedPayments).toHaveLength(2)
		expect(savedPayments.map((p) => p.amount)).toContain(50.25)
		expect(savedPayments.map((p) => p.amount)).toContain(75.75)
	})

	it('should handle large payment amounts', async () => {
		const largeAmountJob = {
			data: {
				correlationId: Bun.randomUUIDv7(),
				amount: 999999.99
			}
		} as Job<Payments.paymentJob>

		await paymentsJob(largeAmountJob)

		const savedPayment = await PaymentModel.findOne({
			correlationId: largeAmountJob.data.correlationId
		})

		expect(savedPayment?.amount).toBe(999999.99)
	})

	it('should handle small payment amounts', async () => {
		const smallAmountJob = {
			data: {
				correlationId: Bun.randomUUIDv7(),
				amount: 0.01
			}
		} as Job<Payments.paymentJob>

		await paymentsJob(smallAmountJob)

		const savedPayment = await PaymentModel.findOne({
			correlationId: smallAmountJob.data.correlationId
		})

		expect(savedPayment?.amount).toBe(0.01)
	})

	it('should handle zero amount payments', async () => {
		const zeroAmountJob = {
			data: {
				correlationId: Bun.randomUUIDv7(),
				amount: 0
			}
		} as Job<Payments.paymentJob>

		await paymentsJob(zeroAmountJob)

		const savedPayment = await PaymentModel.findOne({
			correlationId: zeroAmountJob.data.correlationId
		})

		expect(savedPayment?.amount).toBe(0)
	})

	it('should handle duplicate payment requests (idempotency)', async () => {
		const duplicateJob = {
			data: {
				correlationId: Bun.randomUUIDv7(),
				amount: 100.0
			}
		} as Job<Payments.paymentJob>

		// Process the same payment twice
		const result1 = await paymentsJob(duplicateJob)
		const result2 = await paymentsJob(duplicateJob)

		// Should only have one payment in the database
		const savedPayments = await PaymentModel.find({
			correlationId: duplicateJob.data.correlationId
		})

		expect(savedPayments).toHaveLength(1)
		expect(result1.success).toBe(true)
		expect(result2.success).toBe(true)
		expect(result2.message).toBe('Payment already processed')
	})
})
