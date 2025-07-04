import checkoutSDK from '@paypal/checkout-server-sdk';

/**
 * 返回PayPal HTTP客户端实例，根据环境变量配置沙盒或生产环境
 */
export function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID as string;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET as string;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  if (!clientId || !clientSecret) {
    throw new Error('Missing PayPal client credentials');
  }

  const environment = mode === 'live'
    ? new checkoutSDK.core.LiveEnvironment(clientId, clientSecret)
    : new checkoutSDK.core.SandboxEnvironment(clientId, clientSecret);

  return new checkoutSDK.core.PayPalHttpClient(environment);
}

/**
 * 创建PayPal订单
 * @param orderDetails 订单详情
 */
export async function createPayPalOrder(orderDetails: {
  orderId: string;
  description: string;
  amount: number;
  currency?: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  try {
    const client = getPayPalClient();
    const request = new checkoutSDK.orders.OrdersCreateRequest();
    
    // 推荐返回完整表示
    request.prefer("return=representation");
    
    // 设置订单详情
    request.requestBody({
      intent: "CAPTURE", // 直接捕获付款，而不是授权后再捕获
      purchase_units: [{
        reference_id: orderDetails.orderId,
        description: orderDetails.description,
        amount: {
          currency_code: orderDetails.currency || "USD",
          value: orderDetails.amount.toFixed(2)
        }
      }],
      application_context: {
        return_url: orderDetails.returnUrl,
        cancel_url: orderDetails.cancelUrl,
        brand_name: "Soul Comfort",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING"
      }
    });
    
    const response = await client.execute(request);
    
    return {
      id: response.result.id,
      status: response.result.status,
      paymentUrl: response.result.links.find(link => link.rel === 'approve')?.href || ''
    };
  } catch (error) {
    console.error('创建PayPal订单失败:', error);
    throw error;
  }
}

/**
 * 验证并捕获PayPal订单付款
 * @param orderId PayPal订单ID
 */
export async function capturePayPalOrder(orderId: string) {
  try {
    const client = getPayPalClient();
    const request = new checkoutSDK.orders.OrdersCaptureRequest(orderId);
    
    // 设置请求头
    request.requestBody({});
    
    const response = await client.execute(request);
    
    return {
      id: response.result.id,
      status: response.result.status,
      captureId: response.result.purchase_units[0]?.payments?.captures[0]?.id,
      payerEmail: response.result.payer?.email_address
    };
  } catch (error) {
    console.error('捕获PayPal订单失败:', error);
    throw error;
  }
}