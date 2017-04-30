var configAuth = require("../../config/auth"),
    stripe = require("stripe")(configAuth.stripe.secretKey);


exports.pay = function(req,res)
{
	var token = req.body.stripeToken; 
	var amount = req.body.amount;
	var charge = stripe.charges.create({
	  amount: amount,
	  currency: "egp",
	  source: token,
	}, function(err, charge) {
	  	if(err)
	  	{
	  		switch (err.type) 
	  		{
			  case 'StripeCardError':
			    err.message = "Card Error. Please try again" ; // => e.g. "Your card's expiration year is invalid."
			    break;
			  case 'StripeInvalidRequestError':
			     // err.message = "Invalid Input" ;// Invalid parameters were supplied to Stripe's API
			    break;
			  case 'StripeAPIError':
			     err.message = "Oops!! Something went wrong. Please try again.";// An error occurred internally with Stripe's API
			    break;
			  case 'StripeConnectionError':
			     err.message = "Connection error. Please try again." // Some kind of error occurred during the HTTPS communication
			    break;
			  case 'StripeAuthenticationError':
			    err.message = "Oops!! Something went wrong. Please try again.";// You probably used an incorrect API key
			    break;
			  case 'StripeRateLimitError':
			    err.message = "Oops!! Something went wrong. Please try again.";// Too many requests hit the API too quickly
			    break;
			}
			return res.status(400).json(err.message);
	  	}
	    else
		{
 			return res.status(200).json(charge);
		}
	});
}

exports.refund = function(req, res)
{
	var charge_id = req.body.charge_id;
	var amount = Math.round(req.body.amount * 97);
	var refund = stripe.refunds.create({
		  charge: charge_id,
		  amount: amount
		}, function(err, refund) {
		  if(err)
		  {
		  	res.status(400).json(err.message);
		  }
		  else
		  {
		  	res.status(200).json("refund successfully completed");
		  }
		});
}


