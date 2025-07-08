import { t } from 'elysia'

export namespace Payments {
	export const paymentBody = t.Object({
		correlationId: t.String(),
		amount: t.Numeric()
	})

	export type paymentBody = typeof paymentBody.static
}
