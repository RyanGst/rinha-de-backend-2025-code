import { t } from 'elysia'

export namespace PaymentsSummary {
	export const paymentQuery = t.Object({
		from: t.String(),
		to: t.String()
	})

	export type paymentQuery = typeof paymentQuery.static

	export const paymentSummaryResponse = t.Object({
		default: t.Object({
			totalRequests: t.Number(),
			totalAmount: t.Number()
		}),
		fallback: t.Object({
			totalRequests: t.Number(),
			totalAmount: t.Number()
		})
	})

	export type paymentSummaryResponse = typeof paymentSummaryResponse.static
}
