import {Elysia, status, StatusMap} from "elysia";
import {Payments} from "./model";
import paymentsService from "./service";

export const payments = new Elysia({ prefix: '/payments' }).post(
    '/',
    async (ctx) => {
        await paymentsService.dispatchPayment(ctx.body)
        return status(StatusMap.OK)
    }, {
        body: Payments.paymentBody
    }
)