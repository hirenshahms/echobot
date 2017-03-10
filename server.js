var restify = require('restify');
var builder = require('botbuilder');
var api = require('./apiutil');

// Get secrets from server environment
var botConnectorOptions = { 
    appId: process.env.BOTFRAMEWORK_APPID, 
    appPassword: process.env.BOTFRAMEWORK_APPSECRET
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
//dialog.matches('KPI', builder.DialogAction.send('You asked about a KPI!'));
dialog.matches('KPI', [
   
    function (session, args, next) {   
	    
	// Resolve and store any entities passed from LUIS.
        var kpi = builder.EntityRecognizer.findEntity(args.entities, 'KPI');
        var data = session.dialogData.Data = {
         kpi: kpi
        };
	    
	if (kpi != null ) && (kpi.entity === 'cost variance')
	{
        	session.beginDialog('/costcenter');
	}
    },
    function (session, results) {
	
	var query = 'Cost';
	    
	if (session.dialogData.Data.kpi == null)
	{
		session.send('I know you are asking about a KPI. However I have not yet learnt how to fetch that information!');
	}
	else
	{	    
		var kpi = session.dialogData.Data.kpi.entity;

		if (kpi === 'cost variance')
		{
			query = 'Cost';
			api.getKpis(session, query);
		}
		else if (kpi === 'variable cost')
		{
			query = '% Variable';
			api.getKpis(session, query);
		}
		else if (kpi === 'capital spend') || ((kpi === 'capital cost'))
		{
			query = '% Capital Spend';
			api.getKpis(session, query);
		}
		else
		{
			session.send('I know you are asking about a KPI. However I have not yet learnt how to fetch that information!');
		}
	}
	   	
	}
]);

bot.dialog('/costcenter', [
    function (session) {
        builder.Prompts.text(session, "I would be happy to get that for you. Can you please tell me your cost center?");
    },
    function (session, results) {
	session.send("I will get it for you now and remember that Cost Center for future reviews.");
        session.endDialogWithResult(results);
    }
]);      
	       
	       //function (session) {
   //session.send("Please wait while I retrieve your KPI.");
   //api.getKpis(session, 'Cost');
//    api.getKpis(session, 'Cost YTD');
//    api.getKpis(session, 'Current FY Plan Remaining');
//    api.getKpis(session, '% Variable');
//    api.getKpis(session, '% Capital Spend');
//});

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

server.post('/api/notify', function (req, res) {
    // Process posted notification
    var address = JSON.parse('{"id":"6ba09821805c443ba54aa27c082b7ee8","channelId":"slack","user":{"id":"U4FPSE0UC:T4FLMJ675","name":"hshah"},"conversation":{"isGroup":false,"id":"B4F2ZNURX:T4FLMJ675:D4F24VB88"},"bot":{"id":"B4F2ZNURX:T4FLMJ675","name":"apptiobot"},"serviceUrl":"https://slack.botframework.com","useAuth":true}');
    var notification ='March data has been loaded and verified in Apptio. You can begin your financial review!';

    // Send notification as a proactive message
    var msg = new builder.Message()
        .address(address)
        .text(notification);
    bot.send(msg, function (err) {
        // Return success/failure
        res.status(err ? 500 : 200);
        res.end();
    });
});

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
