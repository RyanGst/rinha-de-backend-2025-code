import {Elysia, status, StatusMap} from "elysia";
import {Payments} from "./model";

export const payments = new Elysia({ prefix: '/payments' }).post(
    '/',
    (ctx) => {
        console.log(ctx.body)
        return status(StatusMap.OK)
    }, {
        body: Payments.paymentBody
    }
)