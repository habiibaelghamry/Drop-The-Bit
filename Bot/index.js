var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var fetch = require('node-fetch')
var app = express()

app.set('port', (process.env.PORT || 5000))


app.use(bodyParser.urlencoded({extended: false}))


app.use(bodyParser.json())


app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})


app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'franshly') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})


app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})


function sendHagatMessage(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Ahlan Ahlan",
                    "image_url": "https://media-cdn.tripadvisor.com/media/photo-s/07/3f/a2/83/icon.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "Check Our Facilities",
                        "payload": "getFacilities"

                    },
                    {
                        "type": "postback",
                        "title": "Check Our Events",
                        "payload": "getEvents"
                    },

                    {
                        "type": "postback",
                        "title": "Check Our Offers",
                        "payload": "getOffers"
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}


function sendGenericMessage(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Ahlan Ahlan",
                    "image_url": "https://media-cdn.tripadvisor.com/media/photo-s/07/3f/a2/83/icon.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "General Info",
                        "payload": "getGeneralInfo"

                    },
                    {
                        "type": "postback",
                        "title": "Check Our Hagat",
                        "payload": "getHagat"
                    },

                    {
                        "type": "postback",
                        "title": "Contact Us",
                        "payload": "getContacts"
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        if (event.message && event.message.text) {

            text = event.message.text
            if (text === 'Hi') {
            	
                sendGenericMessage(sender)
                continue
            }
            sendTextMessage(sender, "Ektb Hi aw doos 3al buttons")
        }
        if (event.postback) {
        	
            text = JSON.stringify(event.postback)
            
            if(text.substring(0,200)== '{"payload":"getGeneralInfo"}'){

            fetch('http://54.187.92.64:3000/business/b/BreakOut')
			.then(res => res.json())
			.then(json =>
				{
			
					sendTextMessage(sender,"Description: " + json.result.description + "\n Address: " + json.result.address +
						"\n Area: " + json.result.area + "\n Fasa7ny Average Rating: " + json.result.average_rating
						,token);
				});
            continue
            }
            else if(text.substring(0,200)== '{"payload":"getHagat"}'){

            	sendHagatMessage(sender)
            	continue
            }
             else if(text.substring(0,200)== '{"payload":"getEvents"}'){

            	fetch('http://54.187.92.64:3000/business/b/BreakOut')
            	.then(res => res.json())
            	.then(json => {
            		
            		if((json.events && json.events.length == 0) || (!json.events)) {
            			sendTextMessage(sender, "No Events",token);
            		} else {
            			getOnceEvents(sender, json.events);
            		}
            	});

            	continue
            }

             else if(text.substring(0,200)== '{"payload":"getFacilities"}'){

            	fetch('http://54.187.92.64:3000/business/b/BreakOut')
            	.then(res => res.json())
            	.then(json => {
            		
            		if((json.facilities && json.facilities.length == 0) || (!json.facilities)) {
            			sendTextMessage(sender, "No Facilities",token);
            		} else {
            			getFacilities(sender, json.facilities);
            		}
            	});
            	continue
            }

             else if(text.substring(0,200)== '{"payload":"getOffers"}'){

				fetch('http://54.187.92.64:3000/offers/viewOffersByName/BreakOut')
            	.then(res => res.json())
            	.then(json => {
            		
            		
            		if((json.offers && json.offers.length == 0) || (!json.offers)) {
            			sendTextMessage(sender, "No Offers",token);
            		} else {
            			getOffers(sender, json.offers);
            		}
            	});

            continue
            }

            else if(text.substring(0,200)== '{"payload":"getContacts"}'){
            	fetch('http://54.187.92.64:3000/business/b/BreakOut')
				.then(res => res.json())
				.then(json =>
				{
					
					getPhones(sender,json.result.phones,json.result.email);
				});
            continue
            }
            else if(text.substring(0,19) == '{"payload":"Event: ') {
        		eventId = text.substring(19, text.length - 2);

        		fetch('http://54.187.92.64:3000/event/getOnceEventDetails/' + eventId)
				.then(res => res.json()) 
				.then(json =>
				{ 
					var date = new Date(json.eventocc.day);
					var day = date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
					sendTextMessage(sender,"Name: " + json.event.name + "\nDescription: " + json.event.description +
					 "\nDay: "+ day + "\nTiming: " + json.eventocc.time + "\nPrice: " + json.event.price +
					 "\nCapacity: " + json.event.capacity + "\nAvailable: "+json.eventocc.available, token);
				});
        		

            }
             else if(text.substring(0,19) == '{"payload":"Offer: ') {
        		offerId = text.substring(19, text.length - 2);

        		fetch('http://54.187.92.64:3000/offers/offerDetails/' + offerId)
				.then(res => res.json()) 
				.then(json =>
				{
					
					sendTextMessage(sender,"Name: " + json.offer.name + "\ntype: " + json.offer.type +
					 "\nValue: "+json.offer.value , token);
				});

            }
            else if(text.substring(0,22) == '{"payload":"Facility: ') {
            	facilityId = text.substring(22, text.length - 2);
            	fetch('http://54.187.92.64:3000/event/getEvents/' + facilityId)
            	.then(res => res.json())
            	.then(json =>
            	{  
                    if(json.events && json.events.length > 0)
            		getDailyEvents(sender, json.events, json.eventocc, json.name);
                    else {
                       
                        sendTextMessage(sender,"No Events",token);
                    }
            	});
            } else if(text.substring(0,17) == '{"payload":"occ: ') {
            	eventId = text.substring(17,text.length - 2);
            	
                
                sendTextMessage(sender,'http://54.187.92.64:8000/#!/viewOccurences/' + eventId,token)
            }
        }
    }
    res.sendStatus(200)
})


var token = "EAABbNRnGzH8BALmi5nfNFdGwx8V1Oodkiu2XChFTZBr01R0YG0b77bpbgbtoI4ZAq4xPyRrK2ZCVt6aRzCSF3SffZATzDnQimZAQC1ZAWhlM56GnMELvCA8g8oMZCMpoaPIbkUzxPub7OuZAVVdsM0KMNSSBhAkLwfH3C7ggga9OTAZDZD"

function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}


function getFacilities(sender, facilities) {
	
	var cards = Math.ceil(facilities.length / 3);
	
	var elem = [];
	for(var i = 0; i < facilities.length; i+=3) {
		var buttons = [];

		var facility1 = facilities[i];
		buttons.push({
			"type":"postback",
			"title":facility1.name,
			payload: "Facility: "+ facility1._id
		})
		if(facilities[i+1]){
			var facility2 = facilities[i+1];
			buttons.push({
				"type":"postback",
				"title":facility2.name,
				payload: "Facility: "+ facility2._id
			})
		}
		if(facilities[i+2]){
			var facility3 = facilities[i+2];
			buttons.push({
				"type":"postback",
				"title":facility3.name,
				payload: "Facility: "+ facility3._id
			})
		}

		

		elem.push({
			"title": "Facilities",
			"image_url": "https://media-cdn.tripadvisor.com/media/photo-s/07/3f/a2/83/icon.jpg",
			"buttons" : buttons
		})

		
	}

	messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elem
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}


function getOnceEvents(sender, events) {
	
	var cards = Math.ceil(events.length / 3);
	
	var elem = [];
	for(var i = 0; i < events.length; i+=3) {
		var buttons = [];

		var event1 = events[i];
		buttons.push({
			"type":"postback",
			"title":event1.name,
			payload: "Event: "+ event1._id
		})
		if(events[i+1]){
			var event2 = events[i+1];
			buttons.push({
				"type":"postback",
				"title":event2.name,
				payload: "Event: "+ event2._id
			})
		}
		if(events[i+2]){
			var event3 = events[i+2];
			buttons.push({
				"type":"postback",
				"title":event3.name,
				payload: "Event: "+ event3._id
			})
		}

		

		elem.push({
			"title": "Events",
			"image_url": "https://media-cdn.tripadvisor.com/media/photo-s/07/3f/a2/83/icon.jpg",
			"buttons" : buttons
		})

		
	}

	messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elem
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}



function getDailyEvents(sender, events, eventoccs, name) {
	
	for(var i = 0; i < events.length; i++)
		for(var j = 0; j < eventoccs.length; j++)
			if(events[i]._id == eventoccs[j].event) {
				events[i].time = eventoccs[j].time;
				break;
			}

	for(var x = 0; x < events.length; x++) {
      	var days = "";
      	
      	for(var y = 0; events[x].daysOff && y < events[x].daysOff.length ; y++){
        	if(events[x].daysOff[y]==0){ days = days + "Sunday, ";}
        	else if(events[x].daysOff[y]==1){ days = days + "Monday, ";}
        	else if(events[x].daysOff[y]==2){ days = days + "Tuesday, ";}
        	else if(events[x].daysOff[y]==3){ days = days + "Wednesday, ";}
        	else if(events[x].daysOff[y]==4){ days = days + "Thursday, ";}
        	else if(events[x].daysOff[y]==5){ days = days + "Friday, ";}
        	else if(events[x].daysOff[y]==6){ days = days + "Saturday, ";}
      	}
		if(events[x].daysOff.length == 0){
			days = "No days off";
			events[x].days = days
		}
		else{
    		events[x].days = days.substring(0, days.length-2);
		}
    }
    
    var cards = events.length;
    var elem = [];
    for(var l = 0; l < events.length; l++) {
    	elem.push({
			"title": events[l].time,
			"subtitle": "Price: " + events[l].price + "\n DaysOff: " + events[l].days,
			"image_url": "https://media-cdn.tripadvisor.com/media/photo-s/07/3f/a2/83/icon.jpg",
			"buttons" : [{
                        "type": "postback",
                        "title": "View Occurrences",
                        "payload": "occ: "+events[l]._id
                    }]
		})
    }
    messageData = {
        "attachment": {
        	"type": "template",
        	"payload": {
       	    	"template_type": "generic",
            	"elements": elem
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}


function getPhones(sender, phones,email) {
	var cards = phones.length;
    var elem = [];
    for(var l = 0; l < phones.length; l++) {
    	elem.push({
			"title": "Email",
			"subtitle": email,
			"image_url": "https://media-cdn.tripadvisor.com/media/photo-s/07/3f/a2/83/icon.jpg",
			"buttons" : [
					{
          				"type":"phone_number",
          				"title":"Call "+phones[l],
          				"payload":phones[l]
       				}
				]
		})
    }
    messageData = {
        "attachment": {
        	"type": "template",
        	"payload": {
       	    	"template_type": "generic",
            	"elements": elem
            }
        }
    }

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function getOffers(sender, offers) {
	
	var cards = Math.ceil(offers.length / 3);
	
	var elem = [];
	for(var i = 0; i < offers.length; i+=3) {
		var buttons = [];

		var offer1 = offers[i];
		buttons.push({
			"type":"postback",
			"title":offer1.name,
			payload: "Offer: "+ offer1._id

		})
		if(offers[i+1]){
			var offer2 = offers[i+1];
			buttons.push({
				"type":"postback",
				"title":offer2.name,
				payload: "Offer: "+ offer2._id
			})
		}
		if(offers[i+2]){
			var offer3 = offers[i+2];
			buttons.push({
				"type":"postback",
				"title":offer3.name,
				payload: "Offer: "+ offer3._id
			})
		}

		

		elem.push({
			"title": "Offers",
			"image_url": "https://media-cdn.tripadvisor.com/media/photo-s/07/3f/a2/83/icon.jpg",
			"buttons" : buttons
		})

		
	}

	messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elem
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
