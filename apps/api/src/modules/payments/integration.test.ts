import { describe, expect, it } from "bun:test";
import { app } from "../..";

describe('Payments', () => {
    it('should dispatch a payment', async () => {
        const payment = {
            amount: 100,
            correlationId: Bun.randomUUIDv7()
        }

        const request = new Request('http://localhost:3000/payments', {
            method: 'POST',
            body: JSON.stringify(payment),
            headers: {  
                'Content-Type': 'application/json'
            }
        })

        const response = await app.handle(request)

        expect(response.status).toBe(200)
    })
})