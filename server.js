const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.API_KEY);
const axios = require('axios').default;
const cors = require('cors');

app.use(cors());
app.use(express.json());

const YOUR_DOMAIN = 'https://fluidinova.webflow.io';

app.post('/validate-eori', async (req, res) => {
    const { eoris } = req.body;

    try {
        const response = await axios.post('https://api.service.hmrc.gov.uk/customs/eori/lookup/check-multiple-eori', {
            //eoris: [eori]
            eoris: eoris
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.data || !response.data.status) {
            throw new Error('Failed to validate EORI');
        }

        if (response.data.status === 200) {
            res.status(200).json({ message: "EORI - Success!" });
        } else if (response.data.status === 400) {
            res.status(400).json({ message: "EORI - Invalid number, cannot purchase as business" });
        } else if (response.data.status === 600) {
            res.status(500).json({ message: "EORI - Server error. Please contact admin" });
        }
    } catch (error) {
        console.error('Error validating EORI:', error);
        res.status(500).json({ error: 'An error occurred while validating EORI' });
    }
});

app.get('/validate-vat/:vat_number', async (req, res) => {
    const { vat_number } = req.params;

    try {
        const response = await axios.get(`https://api.vatcheckapi.com/v2/check?vat_number=${vat_number}`, {
            headers: {
                'X-Api-Key': 'vat_live_YhSULynHRB5Nae6pJdDqk0IaEr3jUngdReMQxWnQ'
            }
        });
        res.json(response.data);
        
    } catch (error) {
        console.error('Error validating VAT number:', error);
        res.status(500).json({ error: 'An error occurred while validating VAT number' });
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
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'An error occurred while creating checkout session' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});