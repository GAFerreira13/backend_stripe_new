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
    sendEmailToProjectManager(userData);

    res.status(200).json({ message: "Signup successful" });
});

function sendEmailToProjectManager(userData) {
    const transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
            user: 'backend-provider@outlook.com',
            pass: process.env.emailpass
        }
    });

    const mailOptions = {
        from: 'backend-provider@outlook.com',
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
                    color: #1a1a1a;
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
                    color: #007bff;
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
    sendEmailToProjectManager(formfields);

    res.status(200).json({ message: "Contact notification successful" });
});

function sendEmailToProjectManager(formfields) {
    const transporter = nodemailer.createTransport({
        host: 'mail.fluidinova.pt',
        port: 465,
        secure: true,
        auth: {
            user: 'forms@fluidinova.pt',
            pass: process.env.emailpass
        }
    });

    const mailOptions = {
        from: 'backend-provider@outlook.com',
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
                    color: #1a1a1a;
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

    transporter.sendMail(mailOptions, (error, info) => {
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
        res.status(500).json({ error: 'An error occurred while validating VAT number' });
        console.error('Error validating VAT number:', error);
    }
});


app.post('/create-checkout-session', async (req, res) => {
    const { customer, shippingAddress, cartItems } = req.body;

    /*if (!amount || !currency || !productName || !productImage || !successUrl || !cancelUrl) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }*/


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
              success_url: 'https://fluidinova.webflow.io/',
              cancel_url: 'https://fluidinova.webflow.io/check-out',
              allow_promotion_codes: true,
              automatic_tax: {
                enabled: false
            },
            customer_creation: 'always',
            tax_id_collection: {
                enabled: true
            }
              
            });
 
        res.json({ url: session.url })
        
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating checkout session' });
        console.error('Error creating checkout session:', error);
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});