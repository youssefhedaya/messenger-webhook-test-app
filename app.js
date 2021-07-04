'use strict';

let control = true
let reply = 0
let timeTakeControl = 0

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 8000, () => console.log('webhook is listening'));

function sleep(s) {
return new Promise((resolve) => {
  setTimeout(resolve, s);
});
}

function handleMessage(sender_psid, received_message, time) {
console.log(time)
    if(time<timeTakeControl){
        console.log("Didnt reply")
    return
    }
    if(reply>0){
        reply--
        return
    }
  let date = new Date()

  let response;

  // Check if the message contains text
  if (received_message.text) {   

    if (received_message.text.includes("1")){
      response={
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"generic",
            "elements":[
              {
                "title":"Welcome!",
                "image_url":"https://homepages.cae.wisc.edu/~ece533/images/airplane.png",
                "subtitle":"We have the right hat for everyone.",
                "default_action": {
                  "type": "web_url",
                  "url": "https://petersfancybrownhats.com/view?item=103",
                  "webview_height_ratio": "tall",
              },
              "buttons":[
                {
                  "type":"postback",
                  "title":"Talk To Agent",
                  "payload":"Agent"
                },
                {
                  "type":"phone_number",
                  "title":"Call us",
                  "payload":"+201006939205"
                }
              ],
             
            }
            

            ],
          
          }
        }
        
    }
    }
    
    else if (received_message.text.includes("date") || received_message.text.includes("Date")){
      response = {
        "text": date.toString()
      }
    }
    else {
      response = {
        "text": `I did not get "${received_message.text}". I'm here just to tell you today's exact date!`
      }
    }

    // Create the payload for a basic text message
 
  }  
  
  // Sends the response message
  callSendAPI(sender_psid, response);    
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    if(!control){
        return
    }
    
  let response;
  
  // Get the payload for the postback
  let title = received_postback.title;
  let payload = received_postback.payload;


  // Set the response based on the postback payload
  if (title === 'Call Us') {
    response = {

      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"You Can Call Us !",
          "buttons":[
            {
              "type":"phone_number",
              "title":"Call Now",
              "payload" : payload
            }
          ]
        }
      }



    }
  } else if (title === 'Services') {
    response = { "text": "We have no services" }
  }

  else if (title === 'Talk To Agent'){
    response = { "text": "Our Support will be here soon" }
    control = false
    Handover(sender_psid);

  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);

}

function takeThreadControl (sender_psid){
    control = true

  let request_body = {
    "recipient":{"id":sender_psid},
    "metadata":"Take thread back" 
  }

var request = require('request');
// Send the HTTP request to the Messenger Platform
   request({
    "uri": "https://graph.facebook.com/v11.0/me/take_thread_control",
    "qs": { "access_token": "EAAMRj0MjGYcBAERv5CuUMInm2LjSgUeBZB3kyfPOkCpvsckZAg51ZAhfPZAZCE9pbuF87zXgESUPhBsIcZB2ZCTZAiB4W5QMPG3Gjs4usuAcaCn0w0eHurXtKCP0srIYCqq8UHeCUo34RMtOmZA4eGoI1929YZBys7rvSRwZA5aZAkkb1XYDZCAkyU4xF" },
    "method": "POST",
    "json":  request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('OK, I took Control')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}

function Handover(sender_psid) {
    control = false

  let request_body = {
    "recipient":{"id":sender_psid},
    "target_app_id":"263902037430900",
    "metadata":"String to pass to secondary receiver app" 
  }

var request = require('request');

// Send the HTTP request to the Messenger Platform
   request({
    "uri": "https://graph.facebook.com/v11.0/me/pass_thread_control",
    "qs": { "access_token": "EAAMRj0MjGYcBAERv5CuUMInm2LjSgUeBZB3kyfPOkCpvsckZAg51ZAhfPZAZCE9pbuF87zXgESUPhBsIcZB2ZCTZAiB4W5QMPG3Gjs4usuAcaCn0w0eHurXtKCP0srIYCqq8UHeCUo34RMtOmZA4eGoI1929YZBys7rvSRwZA5aZAkkb1XYDZCAkyU4xF" },
    "method": "POST",
    "json":  request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('OK, I passed the control')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}
// Sends response messages via the Send API
function sender_action(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "sender_action":"typing_on"
  }
      var request = require('request');

    // Send the HTTP request to the Messenger Platform
       request({
        "uri": "https://graph.facebook.com/v11.0/me/messages",
        "qs": { "access_token": "EAAMRj0MjGYcBAERv5CuUMInm2LjSgUeBZB3kyfPOkCpvsckZAg51ZAhfPZAZCE9pbuF87zXgESUPhBsIcZB2ZCTZAiB4W5QMPG3Gjs4usuAcaCn0w0eHurXtKCP0srIYCqq8UHeCUo34RMtOmZA4eGoI1929YZBys7rvSRwZA5aZAkkb1XYDZCAkyU4xF" },
        "method": "POST",
        "json": request_body
      }, (err, res, body) => {
        if (!err) {
          console.log('message sent! sender')
        } else {
          console.error("Unable to send message:" + err);
        }
      }); 
}

// Sends response messages via the Send API
 function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response,
    }

    // console.log(response)
        var request = require('request');

      // Send the HTTP request to the Messenger Platform
        request({
          "uri": "https://graph.facebook.com/v11.0/me/messages",
          "qs": { "access_token": "EAAMRj0MjGYcBAERv5CuUMInm2LjSgUeBZB3kyfPOkCpvsckZAg51ZAhfPZAZCE9pbuF87zXgESUPhBsIcZB2ZCTZAiB4W5QMPG3Gjs4usuAcaCn0w0eHurXtKCP0srIYCqq8UHeCUo34RMtOmZA4eGoI1929YZBys7rvSRwZA5aZAkkb1XYDZCAkyU4xF" },
          "method": "POST",
          "json": request_body
        }, (err, res, body) => {
          if (!err) {
            console.log('message sent!')
          } else {
            console.error("Unable to send message:" + err);
          }
        }); 
}

// // Creates the endpoint for our webhook 
//     app.post('/webhook', (request, res) => {

//         let body = request.body;
//     console.log("body",body)
  
//     // Checks this is an event from a page subscription
//     if (body.object === 'page') {


//         // console.log("webhook")
//         // console.log("Body: ", request.body)
//         // const webhook_events = request.body.entry[0];
//         // console.log(webhook_events.standby)
//         // // console.log('webhook_events : ', webhook_events);
    
//         // // Secondary Receiver is in control - listen on standby channel
//         //  if (webhook_events.standby) {

    
//         //     // iterate webhook events from standby channel
//         //      webhook_events.standby.forEach(event => {
//         //         console.log("Hello , I'm In")
    
//         //         const psid = event.sender.id;
//         //         const message = event.message;

//         //         console.log("psid",psid)
//         //         console.log("message",message)
    
//         //         // check if the user want back to the bot
//         //         if (message && (message.text == 'exit' || message.text == 'back')) {
    
//         //             // HandoverProtocol.takeThreadControl is just call the facebook api to takeThreadControl
//         //             takeThreadControl(psid).then(reps => {
    
//         //                 // replay.sendMessage also call facebook api to send a message to the user to let him know he is back chat with the bot 
//         //                 callSendAPI(psid, 'Hi, your are back to the BOT');
    
//         //             }).catch(err => console.log(err));
//         //         }
    
//         //      });   
//         //  }
    
//         // respond to all webhook events with 200 OK
  
//       // Iterates over each entry - there may be multiple if batched
//     //   body.entry.forEach(function(entry) {
  
//         // Gets the message. entry.messaging is an array, but 
//         // will only ever contain one message, so we get index 0
//         console.log("entry[0](ahmed)",body.entry[0].messaging)
//         let webhook_event = body.entry[0].messaging;
//         let webhook_event_standby = body.entry[0].standby; 
//        // console.log("webhookevent",webhook_event);
//         //console.log("standby",webhook_event_standby.message)

//           // Get the sender PSID
//         let sender_psid = webhook_event.sender.id;
//         console.log('Sender PSID: ' + sender_psid);
        

        
//         // Check if the event is a message or postback and
//         // pass the event to the appropriate handler function
//         if (webhook_event.message) {
//           handleMessage(sender_psid, webhook_event.message);        
//         } else if (webhook_event.postback) {
//         sender_action(sender_psid,webhook_event.postback);
//           sleep(300);
//           handlePostback(sender_psid, webhook_event.postback);
//         }
      
//     //   });
  
//       // Returns a '200 OK' response to all requests
//       res.status(200).send('EVENT_RECEIVED');
    
//     } else {
//       // Returns a '404 Not Found' if event is not from a page subscription
//       res.sendStatus(404);
//     }
    
  
//     }) 


// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  

    
    let body = req.body;
     console.log("body",body)
  
    // Checks this is an event from a page subscription
    if (body.object === 'page') {
  
      // Iterates over each entry - there may be multiple if batched
    //   body.entry.forEach(function(entry) {
  
        // Gets the message. entry.messaging is an array, but 
        // will only ever contain one message, so we get index 0
        let webhook_event = body.entry[0].messaging? body.entry[0].messaging[0] : 0;
        let webhook_event_standby = body.entry[0].standby? body.entry[0].standby[0] : 0 ;
        // console.log("webhookevent",webhook_event);
        // console.log("standby",webhook_event_standby.message)

        if (webhook_event.pass_thread_control){
            timeTakeControl = body.entry[0].time
            takeThreadControl(webhook_event.sender.id);
        }

          // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);
        

        
        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message && control) {
          handleMessage(sender_psid, webhook_event.message,body.entry[0].time);        
        } else if (webhook_event.postback) {
        sender_action(sender_psid,webhook_event.postback);
          sleep(300);
          handlePostback(sender_psid, webhook_event.postback);
        }
      
    //   });
  
      // Returns a '200 OK' response to all requests
      res.status(200).send('EVENT_RECEIVED');
    
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
    
  
  });




  // Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "2468"
      
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
      
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
    
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
      }
    }
  });
