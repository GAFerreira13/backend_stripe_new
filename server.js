const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.API_KEY);
const axios = require('axios').default;
const nodemailer = require('nodemailer');
const cors = require('cors');

app.use(cors());
app.use(express.json());

const YOUR_DOMAIN = 'https://fluidinova.webflow.io';

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
        to: 'gon.skater@hotmail.com',
        subject: 'New User Signup',
        html: `<p>A new user has signed up:</p><p>Name: ${userData.name}</p><p>Email: ${userData.email}</p><p>Activity: ${userData.activity}</p><p>Type of application: ${userData.application}</p><p>Receive communications: ${userData.acceptcomm}</p>`
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
            livemode: 'true',
            
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
            billing_address_collection: 'required',
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