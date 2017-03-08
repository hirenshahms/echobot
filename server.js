var restify = require('restify');
var builder = require('botbuilder');

// Get secrets from server environment
var botConnectorOptions = { 
    //appId: process.env.BOTFRAMEWORK_APPID, 
    //appPassword: process.env.BOTFRAMEWORK_APPSECRET
    //appId: "12345", 
    //appPassword: "12345"
};

// Create bot
var connector = new builder.ChatConnector(botConnectorOptions);
var bot = new builder.UniversalBot(connector);

//bot.dialog('/', function (session) {
    
    //respond with user's message
  //  session.send("You said " + session.message.text);
//});

//=========================================================
// Bots Dialogs
//=========================================================

//bot.dialog('/', function (session) {
//    session.send("Hello World");
//});

//
// LUIS Integration
//

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/384145fc-8d4b-4e8a-9d1e-796d2f5e86f3?subscription-key=5cee307472f44e8db7e26968ae4a0f8b&verbose=true';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

// Add intent handlers
dialog.matches('KPI', builder.DialogAction.send('You asked about a KPI!'));
dialog.matches('None', builder.DialogAction.send("I'm sorry I didn't understand. I can only fetch KPIs!"));
dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I can only fetch KPIs!"));

// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', connector.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
