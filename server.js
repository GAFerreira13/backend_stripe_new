const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.API_KEY);
const axios = require('axios').default;
const nodemailer = require('nodemailer');
//const redis = require('redis');
//const client = redis.createClient();
const cors = require('cors');

app.use(cors());
app.use(express.json());

//client.set('count', 1, redis.print);

/*app.post('/increment', (req, res) => {
    client.incr('count', (err, newCount) => {
        if (err) {
            console.error('Error incrementing count:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json({ count: newCount });
    });
});

// Get current count
app.get('/count', (req, res) => {
    client.get('count', (err, count) => {
        if (err) {
            console.error('Error getting count:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json({ count: count || 0 });
    });
});*/

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
        from: 'forms@fluidinova.pt',
        to: 'sales@fluidinova.com',

        subject: 'New User Signup',
        //html: `<p><b>A new user has signed up</b></p><p><b>Name:</b> ${userData.name}</p><p><b>Email:</b> ${userData.email}</p><p><b>Activity:</b> ${userData.activity}</p><p><b>Type of application:</b> ${userData.application}</p><p><b>Receive communications:</b> ${userData.acceptcomm}</p>`
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
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
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
        from: 'forms@fluidinova.pt',
        to: ['sales@fluidinova.com', formfields.email],
        subject: 'nanoXIM Information Request',
        //html: `<p>${formfields.nameTitle} ${formfields.name}, thank you for your message! <br>We will contact you as soon as possible.<br><br><br><b>INFORMATION REQUEST SUMMARY</b></p></p><p><b>Activity:</b> ${formfields.activity}</p><p><b>Job:</b> ${formfields.job}</p><p><b>Company:</b> ${formfields.company}</p><p><b>Application:</b> ${formfields.application}</p><p><b>Country:</b> ${formfields.country}</p><p><b>E-mail:</b> ${formfields.email}</p><p><b>Phone number:</b> ${formfields.phone}</p><p><b>Item:</b> ${formfields.itemSelection}</p><p><b>Message:</b> ${formfields.message}</p><br>Best Regards,<br>FLUIDINOVA`
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
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
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
  
    // Iterate through each item in the cart
    cartItems.forEach(item => {
      // Calculate total for the item
      let total = (item.tax_rates === "") ? (item.price_num * item.quantity) : (item.price_num * item.quantity * 1.23);
      total = `€${total.toFixed(2)}`;
  
      // Construct table row for the item
      html += `
        <tr>
          <td>
            ${item.name}<br>
            Weight: ${item.weight}<br>
            Unit price: €${item.price_num}
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
          <td><strong>€${subtotal.toFixed(2)}</strong></td>
        </tr>
    `;
  
    // Add free shipping row
    html += `
        <tr>
          <td colspan="2"><strong>Free shipping</strong></td>
          <td><strong>€0.00</strong></td>
        </tr>
    `;
  
    // Add total row
    html += `
        <tr>
          <td colspan="2"><strong>Total</strong></td>
          <td><strong>€${(subtotal).toFixed(2)}</strong></td>
        </tr>
    `;
  
    // Close table and return the HTML content
    html += `
        </tbody>
      </table>
    `;
  
    return html;
  };
  
  // Calculate subtotal
  const subtotal = cartItems.reduce((acc, item) => {
    return acc + (item.tax_rates === "" ? item.price_num * item.quantity : item.price_num * item.quantity * 1.23);
  }, 0);
  
  console.log("Cart Items:", cartItems); // Add this line to log cartItems

  // Generate order summary HTML
  const orderSummaryHTML = generateOrderSummaryHTML(cartItems, subtotal);
    
    const mailOptions = {
        from: 'forms@fluidinova.pt',
        to: ['sales@fluidinova.com', customer.email],

        subject: `Your nanoXIM Order`,
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid #ddd; /* Add borders to cells */
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2; /* Add background color to header cells */
                }
            </style>
        </head>
        <body>
            <div class="container">
                <p>Hello ${customer.name}, we thank you for placing an order with FLUIDINOVA! </p>
                <p>Once payment has been made, we will send you an e-mail as soon as shipping has begun.
                The details of your order are as follows:</p>
                <b>Date: </b>${datestr}
                <p><b><br><br>BILLING INFORMATION <br></b></p>
                <b>Full name:</b> ${customer.name}<br>
                <b>E-mail:</b> ${customer.email}<br>
                <b>Phone number:</b> ${customer.phone}<br>
                <b>Customer type:</b> ${b2c ? 'Consumer' : 'Business'}<br>
                <b>VAT:</b> ${customer.taxID}<br>
                <p><b><br><br>SHIPPING ADDRESS <br></b></p>
                <b>Street address:</b> ${shippingAddress.str1}<br>
                ${shippingAddress.str2}<br>
                <b>City:</b> ${shippingAddress.c}<br>
                <b>State:</b> ${shippingAddress.s}<br>
                <b>ZIP code:</b> ${shippingAddress.z}<br>
                <b>Country:</b> ${shippingAddress.ct}<br>
                <p><b><br><br>BILLING ADDRESS <br></b></p>
                <b>Street address:</b> ${billAddr.str1}<br>
                 ${billAddr.str2}<br>
                <b>City:</b> ${billAddr.c}<br>
                <b>State:</b> ${billAddr.s}<br>
                <b>ZIP code:</b> ${billAddr.z}<br>
                <b>Country:</b> ${billAddr.ct}<br>
                <p><b><br><br>ORDER SUMMARY</b></p><br>
                ${orderSummaryHTML} <br>
                <p><b><br>ADITIONAL INFORMATION</b></p>${info}


            </div>
        </body>
        </html>
    `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
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
              success_url: 'https://fluidinova.webflow.io/success',
              cancel_url: 'https://fluidinova.webflow.io/cancel',
              allow_promotion_codes: true,
              automatic_tax: {
                enabled: false
            },
            customer_creation: 'always',
            tax_id_collection: {
                enabled: false
            }
              
            });
 
        res.json({ url: session.url })
        sendCheckoutEmail(customer, shpAd, bilAd, cartItems, process.env.year, tx, b2c);

        
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating checkout session' });
        console.error('Error creating the checkout session:', error);
        res.redirect('https://fluidinova.webflow.io/cancel');

    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
