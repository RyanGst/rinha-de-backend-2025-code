const defaultDomain = process.env.PAYMENT_PROCESSOR_URL_DEFAULT
const fallbackDomain = process.env.PAYMENT_PROCESSOR_URL_FALLBACK

const endpoints = {
	health: {
		default: `${defaultDomain}/payments/service-health`,
		fallback: `${fallbackDomain}/payments/service-health`
	},
	payments: {
		default: `${defaultDomain}/payments`,
		fallback: `${fallbackDomain}/payments`
	}
}

export default endpoints
