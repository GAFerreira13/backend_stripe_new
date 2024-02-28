const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.API_KEY);
const cors = require('cors');

// Middleware to enable CORS ...
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

const YOUR_DOMAIN = 'https://fluidinova.webflow.io';

// Endpoint to create checkout session
app.post('/create-checkout-session', async (req, res) => {
    const { customer, shippingAddress, cartItems } = req.body;

    /*if (!amount || !currency || !productName || !productImage || !successUrl || !cancelUrl) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }*/


    try {//so depois das verificacoes todas...
        const session = await stripe.checkout.sessions.create({
            //payment_method_types: ['card'],
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
    console.log('Server is running on port ${PORT}');
});