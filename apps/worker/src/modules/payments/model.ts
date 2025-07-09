import { Type as t } from '@sinclair/typebox'

export namespace Payments {
	export const paymentJob = t.Object({
		correlationId: t.String(),
		amount: t.Number()
	})

	export type paymentJob = typeof paymentJob.static
}
