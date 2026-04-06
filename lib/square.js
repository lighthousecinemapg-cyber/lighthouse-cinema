// ================================================================
// SQUARE API â Payments, Invoices, Customers
// ================================================================
import { Client, Environment } from 'square';
import { v4 as uuidv4 } from 'uuid';

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production'
    ? Environment.Production
    : Environment.Sandbox,
});

const { paymentsApi, invoicesApi, customersApi, ordersApi } = client;
const locationId = process.env.SQUARE_LOCATION_ID;

/**
 * Create or find a Square customer by email
 */
export async function findOrCreateCustomer({ email, name, phone }) {
  try {
    // Search for existing customer
    const searchResult = await customersApi.searchCustomers({
      query: {
        filter: {
          emailAddress: { exact: email },
        },
      },
    });

    if (searchResult.result.customers && searchResult.result.customers.length > 0) {
      return searchResult.result.customers[0];
    }

    // Create new customer
    const [firstName, ...lastParts] = name.split(' ');
    const lastName = lastParts.join(' ') || '';

    const createResult = await customersApi.createCustomer({
      idempotencyKey: uuidv4(),
      emailAddress: email,
      givenName: firstName,
      familyName: lastName,
      phoneNumber: phone,
      companyName: 'Lighthouse Cinema Customer',
    });

    return createResult.result.customer;
  } catch (error) {
    console.error('Square Customer Error:', error);
    throw error;
  }
}

/**
 * Process a deposit payment via Square
 * @param {Object} params
 * @returns {Object} Payment result
 */
export async function processDeposit({
  sourceId, // Payment token from Square Web Payments SDK
  amountCents,
  customerId,
  customerEmail,
  bookingRef,
  note,
}) {
  try {
    const result = await paymentsApi.createPayment({
      idempotencyKey: uuidv4(),
      sourceId,
      amountMoney: {
        amount: BigInt(amountCents),
        currency: 'USD',
      },
      customerId,
      locationId,
      referenceId: bookingRef,
      note: note || `Lighthouse Cinema â 20% Deposit â Booking ${bookingRef}`,
      buyerEmailAddress: customerEmail,
    });

    return result.result.payment;
  } catch (error) {
    console.error('Square Payment Error:', error);
    throw error;
  }
}

/**
 * Create and send a Square Invoice for the remaining balance
 */
export async function createInvoice({
  customerId,
  customerEmail,
  amountCents,
  bookingRef,
  lineItems,
  dueDate, // YYYY-MM-DD
}) {
  try {
    // Create the order first
    const orderLineItems = lineItems.map(item => ({
      name: `${item.eventTitle} â ${item.packageName} (x${item.quantity})`,
      quantity: '1',
      basePriceMoney: {
        amount: BigInt(Math.round(item.lineTotal * 100)),
        currency: 'USD',
      },
    }));

    // Add service fee as line item
    const serviceFeeItem = {
      name: 'Service Fee (18%)',
      quantity: '1',
      basePriceMoney: {
        amount: BigInt(Math.round(lineItems.reduce((sum, i) => sum + i.lineTotal, 0) * 0.18 * 100)),
        currency: 'USD',
      },
    };

    const orderResult = await ordersApi.createOrder({
      order: {
        locationId,
        referenceId: bookingRef,
        customerId,
        lineItems: [...orderLineItems, serviceFeeItem],
      },
      idempotencyKey: uuidv4(),
    });

    const orderId = orderResult.result.order.id;

    // Create invoice
    const invoiceResult = await invoicesApi.createInvoice({
      invoice: {
        locationId,
        orderId,
        primaryRecipient: {
          customerId,
        },
        paymentRequests: [
          {
            requestType: 'BALANCE',
            dueDate: dueDate || getDateInDays(14),
            automaticPaymentSource: 'NONE',
            reminders: [
              { relativeScheduledDays: -3, message: 'Your remaining balance for Lighthouse Cinema is due in 3 days.' },
              { relativeScheduledDays: 0, message: 'Your Lighthouse Cinema balance is due today.' },
            ],
          },
        ],
        deliveryMethod: 'EMAIL',
        title: `Lighthouse Cinema â Remaining Balance`,
        description: `Booking Reference: ${bookingRef}\nRemaining balance after 20% deposit.\nThank you for choosing Lighthouse Cinema!`,
        acceptedPaymentMethods: {
          card: true,
          squareGiftCard: true,
          bankAccount: true,
        },
      },
      idempotencyKey: uuidv4(),
    });

    const invoice = invoiceResult.result.invoice;

    // Publish (send) the invoice
    await invoicesApi.publishInvoice(invoice.id, {
      version: invoice.version,
      idempotencyKey: uuidv4(),
    });

    return invoice;
  } catch (error) {
    console.error('Square Invoice Error:', error);
    throw error;
  }
}

function getDateInDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
