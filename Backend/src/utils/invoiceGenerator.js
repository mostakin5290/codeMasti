
/**
 * Generates the HTML content for a subscription invoice.
 * @param {object} subscription - The subscription document from MongoDB.
 * @param {object} user - The user document from MongoDB.
 * @returns {string} The HTML string for the invoice.
 */
const generateInvoiceHtml = (subscription, user) => {
    const appName = process.env.APP_NAME || "Your App";
    const paymentDate = new Date(subscription.paymentDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const startDate = new Date(subscription.startDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const endDate = new Date(subscription.endDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const invoiceNumber = `INV-${subscription._id.toString().substring(0, 8)}-${new Date(subscription.paymentDate).getTime()}`;

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Subscription Invoice from ${appName}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #fff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #0056b3;
                    text-align: center;
                    margin-bottom: 30px;
                }
                .invoice-header, .invoice-details, .payment-details {
                    margin-bottom: 20px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 15px;
                }
                .invoice-header p, .invoice-details p, .payment-details p {
                    margin: 5px 0;
                }
                .invoice-header span, .invoice-details span, .payment-details span {
                    font-weight: bold;
                    display: inline-block;
                    width: 120px; /* Adjust as needed */
                }
                .table-container {
                    margin-top: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
                .total {
                    text-align: right;
                    font-size: 1.2em;
                    font-weight: bold;
                    margin-top: 20px;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 0.9em;
                    color: #777;
                }
                .text-center {
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="text-center">
                    <img src="YOUR_LOGO_URL_HERE" alt="${appName} Logo" style="max-width: 150px; margin-bottom: 20px;">
                    <h1>Invoice from ${appName}</h1>
                </div>

                <div class="invoice-header">
                    <p><span>Invoice No:</span> ${invoiceNumber}</p>
                    <p><span>Date:</span> ${paymentDate}</p>
                </div>

                <div class="invoice-details">
                    <h3>Billed To:</h3>
                    <p><span>Name:</span> ${user.name || user.email}</p>
                    <p><span>Email:</span> ${user.email}</p>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Plan</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Subscription</td>
                                <td>${subscription.plan}</td>
                                <td>${subscription.currency} ${subscription.amount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="total">
                    Total Paid: ${subscription.currency} ${subscription.amount.toFixed(2)}
                </div>

                <div class="payment-details">
                    <h3>Payment Details:</h3>
                    <p><span>Payment ID:</span> ${subscription.razorpayPaymentId}</p>
                    <p><span>Order ID:</span> ${subscription.razorpayOrderId}</p>
                    <p><span>Payment Method:</span> Razorpay</p>
                    <p><span>Subscription Start:</span> ${startDate}</p>
                    <p><span>Subscription End:</span> ${endDate}</p>
                </div>

                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>${appName} | ${process.env.YOUR_COMPANY_WEBSITE || 'yourwebsite.com'}</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = { generateInvoiceHtml };