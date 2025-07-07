export const config = {
	paymentProcessorUrl: process.env.PAYMENT_PROCESSOR_URL || 'http://localhost:8080',
	paymentProcessorUrlFallback: process.env.PAYMENT_PROCESSOR_URL_FALLBACK || 'http://localhost:8080',
    port: process.env.API_PORT || 3000,
}