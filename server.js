const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.API_KEY);
const axios = require('axios').default;
const nodemailer = require('nodemailer');
const cors = require('cors');

app.use(cors());
app.use(express.json());



app.post('/signup', (req, res) => {
    // Process the signup data
    const userData = req.body;

    // Send email to project manager
    sendSignupEmail(userData);

    res.status(200).json({ message: "Signup successful" });
});

function sendSignupEmail(userData) {
    const transporter = nodemailer.createTransport({
        host: 'plesk01.redicloud.pt',
        port: 465,
        secure: true,
        auth: {
            user: 'forms@fluidinova.pt',
            pass: process.env.emailpass
        }
    });

    const mailOptions = {
        from: 'FLUIDINOVA <forms@fluidinova.pt>',
        to: 'sales@fluidinova.com',

        subject: 'New User Signup',
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New User Signup</title>
            <style>
                body {
                    background-color: #ffffff;
                    font-family: 'DM Sans', sans-serif;
                    color: #00416b;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f0f0f0;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                p {
                    margin: 0 0 10px;
                }
                b {
                    color: #00416b;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <p><b>A new user has signed up</b></p>
                <p><b>Name:</b> ${userData.name}</p>
                <p><b>Email:</b> ${userData.email}</p>
                <p><b>Activity:</b> ${userData.activity}</p>
                <p><b>Type of application:</b> ${userData.application}</p>
                <p><b>Receive communications:</b> ${userData.acceptcomm}</p>
            </div>
        </body>
        </html>
    `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending signup email:', error);
        } else {
            console.log('Signup email sent:', info.response);
        }
    });
}


app.post('/contact', (req, res) => {
    // Process the signup data
    const formfields = req.body;

    // Send email to project manager
    sendContactEmail(formfields);

    res.status(200).json({ message: "Contact notification successful" });
});

function sendContactEmail(formfields) {
    const transporter = nodemailer.createTransport({
        host: 'plesk01.redicloud.pt',
        port: 465,
        secure: true,
        auth: {
            user: 'forms@fluidinova.pt',
            pass: process.env.emailpass
        }
    });

    const mailOptions2 = {
        from: 'FLUIDINOVA <forms@fluidinova.pt>',
        to: ['sales@fluidinova.com', formfields.email],
        subject: 'nanoXIM Information Request',
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Information Request Summary</title>
            <style>
                body {
                    background-color: #ffffff;
                    font-family: 'DM Sans', sans-serif;
                    color: #00416b;
                }
                .container {
                    width: 700px;
                    margin: 0 auto;
                    padding: 50px;
                    background-color: #ffffff;
                    border: 1px solid #cccccc;
                    border-radius: 5px;
                }

                p {
                    line-height: 25px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <p>${formfields.nameTitle} ${formfields.name}, thank you for your message! <br>We will contact you as soon as possible.</p>
                <br>
                <p><b>INFORMATION REQUEST SUMMARY</b></p>
                <p><b>Activity:</b> ${formfields.activity}</p>
                <p><b>Job:</b> ${formfields.job}</p>
                <p><b>Company:</b> ${formfields.company}</p>
                <p><b>Application:</b> ${formfields.application}</p>
                <p><b>Country:</b> ${formfields.country}</p>
                <p><b>E-mail:</b> ${formfields.email}</p>
                <p><b>Phone number:</b> ${formfields.phone}</p>
                <p><b>Item:</b> ${formfields.itemSelection}</p>
                <p><b>Message:</b> ${formfields.message}</p>
                <br>
                <p>Best Regards,<br>FLUIDINOVA</p>
            </div>
        </body>
        </html>
    `
    };

    transporter.sendMail(mailOptions2, (error, info) => {
        if (error) {
            console.error('Error sending contact email:', error);
        } else {
            console.log('contact email sent:', info.response);
        }
    });
}


app.post('/validate-eori', async (req, res) => {
    const { eoris } = req.body;

    try {
        const response = await axios.post('https://api.service.hmrc.gov.uk/customs/eori/lookup/check-multiple-eori', {
            eoris: eoris
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    
        res.json(response.data);
        console.log('Received eoris:', eoris);
        if (!response.data || !response.data.status) {
            res.status(500).json({ error: 'An error occurred while validating EORI' });
            throw new Error('Failed to validate EORI');
        } else if (response.data.status === 200) {
            res.status(200).json({ message: "EORI - Success!" });
        } else if (response.data.status === 400) {
            res.status(400).json({ message: "EORI - Invalid number, cannot purchase as business" });
        } else if (response.data.status === 600) {
            res.status(500).json({ message: "EORI - Server error. Please contact admin" });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while validating EORI' });
        console.error('Error validating EORI:', error);
    }
});

app.get('/validate-vat/:vat_number', async (req, res) => {
    const { vat_number } = req.params;

    try {
        const apiKey = 'vat_live_YhSULynHRB5Nae6pJdDqk0IaEr3jUngdReMQxWnQ';
        const response = await axios.get(`https://api.vatcheckapi.com/v2/check?vat_number=${vat_number}&apikey=${apiKey}`, {
            headers: {
                'X-Api-Key': apiKey
            }
        });
        res.json(response.data);
        
    } catch (error) {
        res.status(500).json({ error: 'A error occurred while validating VAT ' });
        console.error('Errorr validating VAT number:', error);
    }
});

function sendCheckoutEmail(customer, shippingAddress, billAddr, cartItems, orderid, info, b2c) {
    const transporter = nodemailer.createTransport({
        host: 'plesk01.redicloud.pt',
        port: 465,
        secure: true,
        auth: {
            user: 'forms@fluidinova.pt',
            pass: process.env.emailpass
        }
    });
    console.log("tudo ok 4");

    const d = new Date();
    let datestr = d.toString();

// Constructing the HTML content for the email
const generateOrderSummaryHTML = (cartItems, subtotal) => {
    // Create table header
    let html = `
      <table>
        <thead>
          <tr>
            <th><strong>Item</strong></th>
            <th><strong>Quantity</strong></th>
            <th><strong>Total</strong></th>
          </tr>
        </thead>
        <tbody>
    `;
    var subtotal = 0;
    var taxed = false;
    // Iterate through each item in the cart
    cartItems.forEach(item => {
        let total = item.price_num * item.quantity;
        subtotal += total;
        if (item.taxID !== "") taxed = true;

      total = `€${total.toFixed(2)}`;
  
      html += `
        <tr>
          <td>
            ${item.name}<br>
            Weight: ${item.weight}<br>
            Unit price: €${(item.price_num).toFixed(2)}
          </td>
          <td>${item.quantity}</td>
          <td>${total}</td>
        </tr>
      `;
    });
  
    // Add subtotal row
    html += `
        <tr>
          <td colspan="2"><strong>Subtotal</strong></td>
          <td>€${subtotal.toFixed(2)}</td>
        </tr>
    `;
    //VAT row
    html += `
        <tr>
          <td colspan="2"><strong>VAT (23%)</strong></td>
          <td>€${taxed ? (subtotal*0.23).toFixed(2) : "0"}</td>
        </tr>
    `;
  
    // Add free shipping row
    html += `
        <tr>
          <td colspan="2"><strong>Shipping</strong></td>
          <td>€0.00</td>
        </tr>
    `;
  
    // Add total row
    html += `
        <tr>
          <td colspan="2"><strong>Total</strong></td>
          <td><strong>€${(taxed ? subtotal*1.23 : subtotal).toFixed(2)}</strong></td>
        </tr>
    `;
  
    // Close table and return the HTML content
    html += `
        </tbody>
      </table>
    `;
    console.log("tudo ok 5");

    return html;
  };
  
  // Calculate subtotal
  const subtotal = cartItems.reduce((acc, item) => {
    return acc + item.price_num * item.quantity;
  }, 0);
  
    console.log("Cart Items:", cartItems); // Add this line to log cartItems
    console.log("tudo ok 10");


  // Generate order summary HTML
    const orderSummaryHTML = generateOrderSummaryHTML(cartItems, subtotal);
    console.log("tudo ok order");
    
    const mailOptions = {
        from: 'FLUIDINOVA <forms@fluidinova.pt>',
        to: ['sales@fluidinova.com', customer.email],

        subject: `Your nanoXIM Order`,
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=75%, initial-scale=1.0">
            <title>Checkout</title>
            <style>
                body {
                    background-color: #ffffff;
                    font-family: 'DM Sans', sans-serif;
                    color: #00416b;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f5fbfa;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .logo {
                    display: block;
                    margin: 0 auto 40px; /* 40px margin bottom */
                    max-width: 30%;
                    height: auto;
                }
                p {
                    margin: 0 0 10px;
                    color: #00416b;
                }
                b {
                    color: #00416b;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-family: 'DM Sans', sans-serif;
                    color: #00416b;
                }
                th, td {
                    border: 1px solid #ddd; /* Add borders to cells */
                    padding: 8px;
                    text-align: left;
                    font-family: 'DM Sans', sans-serif;
                    color: #00416b;
                }
                th {
                    background-color: #00416b; /* Add background color to header cells */
                    font-family: 'DM Sans', sans-serif;
                    color: #ffffff;
                }
                
            </style>
        </head>
        <body>
            <div class="container">
            <img class="logo" src="https://uploads-ssl.webflow.com/64a6f64c060e8fd934d2d554/659d95ae46d190afa40905e4_fluidinova-cor-azul.png" alt="Company Logo">
                <p>Hello ${customer.name}, we thank you for placing an order with FLUIDINOVA! </p>
                <p>Once payment has been made and shipping has begun, we will send you an e-mail with shipping information.
                The details of your order are as follows:</p>
                <p><strong>Date: </strong>${datestr}<br>
                <strong><br>BILLING INFORMATION <br></strong>
                <strong>Full name:</strong> ${customer.name}<br>
                <strong>E-mail:</strong> ${customer.email}<br>
                <strong>Phone number:</strong> ${customer.phone}<br>
                <strong>Customer type:</strong> ${b2c ? 'Consumer' : 'Business'}<br>
                <strong>VAT:</strong> ${customer.taxID}<br>
                <strong><br>SHIPPING ADDRESS <br></strong>
                <strong>Street address:</strong> ${shippingAddress.str1}<br>
                <strong>Street address 2:</strong>${shippingAddress.str2}<br>
                <strong>City:</strong> ${shippingAddress.c}<br>
                <strong>State:</strong> ${shippingAddress.s}<br>
                <strong>ZIP code:</strong> ${shippingAddress.z}<br>
                <strong>Country:</strong> ${shippingAddress.ct}<br>
                <strong><br>BILLING ADDRESS <br></strong>
                <strong>Street address:</strong> ${billAddr.str1}<br>
                <strong>Street address 2:</strong> ${billAddr.str2}<br>
                <strong>City:</strong> ${billAddr.c}<br>
                <strong>State:</strong> ${billAddr.s}<br>
                <strong>ZIP code:</strong> ${billAddr.z}<br>
                <strong>Country:</strong> ${billAddr.ct}<br>
                <strong><br>ADDITIONAL INFORMATION</strong>${info}<br>
                <strong><br>ORDER SUMMARY</strong><br></p><br>
                ${orderSummaryHTML} <br>
                <p>If you have any questions, please contact sales@fluidinova.com</p>


            </div>
        </body>
        </html>
    `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        console.log("tudo ok 15");

        if (error) {
            console.error('Error sending checkout email:', error);
        } else {
            console.log('checkout email sent:', info.response);
        }
    });
}

/*shipping_address_collection: {
                allowed_countries: ['AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AG', 'AR', 'AM', 'AW', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BQ', 'BA', 'BW', 'BR', 'IO', 'VG', 'BN', 'BG', 'BF', 'BI', 'CV', 'KH', 'CM', 'CA', 'KY', 'TD', 'CL', 'CN', 'CX', 'CC', 'CO', 'CK', 'CR', 'HR', 'CW', 'CY', 'CZ', 'CD', 'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'ER', 'EE', 'SZ', 'ET', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF', 'GA', 'GM', 'GE', 'DE', 'GH', 'PI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GY', 'HT', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'DQ', 'IE', 'IM', 'IL', 'IT', 'CI', 'JM', 'JP', 'JE', 'JO', 'KZ', 'KE', 'XK', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'NA', 'NP', 'NL', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NF', 'MK', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'PR', 'QA', 'CG', 'RE', 'RO', 'RW', 'BL', 'KN', 'LC', 'MF', 'VC', 'WS', 'SM', 'SA', 'SN', 'RS', 'SC', 'SG', 'SX', 'SK', 'SI', 'ZA', 'GS', 'KR', 'SS', 'ES', 'LK', 'SR', 'SJ', 'SE', 'CH', 'TQ', 'TZ', 'TH', 'TL', 'TG', 'TO', 'TT', 'TN', 'TR', 'TM', 'TC', 'VI', 'UG', 'AE', 'GB', 'US', 'UM', 'UY', 'UZ', 'VU', 'VA', 'VE', 'VN', 'WF', 'EH', 'ZM', 'ZW'],
              },*/

app.post('/create-checkout-session', async (req, res) => {
    const { customer, shpAd, bilAd, cartItems, tx, b2c} = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            customer_email: customer.email,
            submit_type: 'auto',
            billing_address_collection: 'auto',
            
            line_items: cartItems.map(item => ({
                price: item.price,
                quantity: item.quantity,
                tax_rates: [item.tax_rates]
            })),
              mode: 'payment',
              success_url: 'https://www.fluidinova.com/success',
              cancel_url: 'https://www.fluidinova.com/cancel',
              allow_promotion_codes: true,
              automatic_tax: {
                enabled: false
            },
            customer_creation: 'always',
            tax_id_collection: {
                enabled: false
            }
              
            });
            console.log("tudo ok 2");

            res.json({ url: session.url });
            console.log("tudo ok 3");

            // Send email asynchronously
            sendCheckoutEmail(customer, shpAd, bilAd, cartItems, process.env.year, tx, b2c)
                .then(() => {
                    console.log('Checkout email sent successfully');
                })
                .catch(error => {
                    console.error('Error sending checkout email:', error);
                });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while creating checkout session' });
            console.error('Error creating the checkout session:', error);
            res.redirect('https://www.fluidinova.com/cancel');
        }
    });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
