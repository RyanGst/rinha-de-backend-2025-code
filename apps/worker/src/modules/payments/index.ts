import { Job } from "bullmq";
import { Payments } from "./model";
import service from "./service";
import endpoints from "../../config/endpoint";

const paymentsJob = async (job: Job<Payments.paymentJob>) => {
    console.log('Processing payment', job.data);
    
    const { correlationId, amount } = job.data

    const defaultHealth = await service.getHealth('default')
    const fallbackHealth = await service.getHealth('fallback')

    if (defaultHealth.failing && fallbackHealth.failing) {
        throw new Error('Both processors are failing')
    }

    const processor = defaultHealth.failing ? 'fallback' : 'default'

    const body = { correlationId, amount, requestedAt: new Date().toISOString() };
    
    const request = new Request(endpoints.payments[processor], {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const response = await fetch(request)
    
    if (!response.ok) {
        throw new Error('Failed to process payment')
    }

    const data = await response.json() as { message: "payment processed successfully" }

    
    if (data.message !== "payment processed successfully") {
        throw new Error('Failed to process payment')
    }

    await Payments.PaymentModel.create({
        correlationId,
        amount,
        requestedAt: new Date(),
        processor
    })

    console.log('Payment processed successfully');

}

export default paymentsJob