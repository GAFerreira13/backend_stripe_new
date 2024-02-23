const express = require('express');
const app = express();
const stripe = require('stripe')(API_KEY);
const cors = require('cors');

// Middleware to enable CORS ...
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

const YOUR_DOMAIN = 'https://fluidinova.webflow.io';

// Endpoint to create checkout session
app.post('/create-checkout-session', async (req, res) => {
    const { name, email, taxID } = req.body;

    /*if (!amount || !currency || !productName || !productImage || !successUrl || !cancelUrl) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }*/


    try {//so depois das verificacoes todas...
        const session = await stripe.checkout.sessions.create({
            //payment_method_types: ['card'],
            line_items: [
                {
                  // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                  price: 'price_1Ok68tI6TgsJpVaUh50ZW7jc',//EXEMPLOOOOOOOOOO
                  quantity: 1,
                },
                {
                    // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                    price: 'price_1Ok62kI6TgsJpVaU1Ray51Pa',//EXEMPLOOOOOOOOOO
                    quantity: 1,
                },
                {
                    // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                    price: 'price_1Ok62RI6TgsJpVaUpjjQ5EuJ',//EXEMPLOOOOOOOOOO
                    quantity: 1,
                  },
              ],
              mode: 'payment',
              success_url: 'https://fluidinova.webflow.io/success',
              cancel_url: 'https://fluidinova.webflow.io/cancel',
            });

        //res.status(200).json({ sessionId: session.id });
        //res.redirect(303, session.url);
        //res.json({ url: session.url })
        
        // Access the URL from the session's payment_intent object
        const url = session.payment_intent.charges.data[0].receipt_url;

        res.json({ url });

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
