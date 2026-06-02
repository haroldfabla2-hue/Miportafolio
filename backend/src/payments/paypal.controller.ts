import { Controller, Post, Body, Headers, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { Public } from '../auth/public.decorator';

@Controller('payments/paypal')
export class PaypalController {
    constructor(private readonly paypalService: PaypalService) {}

    @Public()
    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async handleWebhook(@Body() body: any, @Headers() headers: any) {
        return this.paypalService.handleWebhook(body, headers);
    }
}
