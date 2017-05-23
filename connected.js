// Author: PK Banks
//  https://github.com/pkbanks
//  pkbanks@gmail.com

// CS50x Miami, Cohort 7
// April 2017

// Built on Microsoft Bot Framework, with node.js

// While the code in this file is mine, these are resources that I relied upon:
//  • node.js and npm (node package manager)
//  • Microsoft Bot Framework
//      see here for documentation: https://docs.botframework.com/en-us/
//  • Hands-on tutorial by Joe Raio and Dan Egan, hosted by Refresh Miami.
//      https://github.com/joescars/BotWorkshop



// **** configuration ****
var restify = require('restify');
var builder = require('botbuilder');
var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

var connector = new builder.ChatConnector({
    appId: 'MICROSOFT-APP-ID',      // i can provide you with this upon request
    appPassword: 'MICROSOFT_APP_PASSWORD'       // i can provide you with this upon request
});

// map the endpoint to /api/messages
server.post('/api/messages', connector.listen());
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));

// ****************************
// begin here

var bot = new builder.UniversalBot(connector, [
    function (session) {
        var logoUrl = "http://reebokcrossfit5thave.com/wp-content/uploads/2013/10/REebokCrossFit_MiamiBeachLogo.jpg";
        var msg = "![Reebok Crossfit Miami Beach](" + logoUrl + ")" +
            "Hello...I'm Crossy.\n\n" +
            "Welcome to Reebok Crossfit Miami Beach.  I'm here to help you."
        session.send(msg);
        session.beginDialog('mainMenu');
    // },
    // function (session, results) {
    //     session.endConversation("Goodbye until next time...");
    }
]);

// **** dialogs ****

// Add root menu dialog
bot.dialog('mainMenu', [
    function (session) {
        var msg = "**Main Menu**";
        var options = 'Class Schedule and Hours|Membership|Drop-Ins|Get Started|Visit Us|About Us';
        builder.Prompts.choice(session, msg, options);
    },
    function (session, results) {
        switch (results.response.index) {
            case 0:
                session.beginDialog('scheduleAndHours');
                break;
            case 1:
                session.beginDialog('membership');
                break;
            case 2:
                session.beginDialog('dropIns');
                break;
            case 3:
                session.beginDialog('getStarted');
                break;
            case 4:
                session.beginDialog('visitUs');
                break;
            case 5:
                session.beginDialog('aboutUs');
                break;
            default:
                session.endDialog();
                break;
        }
    },
    function (session) {
        // Reload menu
        session.send("taking you back to Main Menu...");
        session.replaceDialog('mainMenu');
    }
]).reloadAction('mainMenu', null, { matches: /^(menu|back)/i });



// Class Schedule & Hours
bot.dialog('scheduleAndHours', [
    function(session){
        session.beginDialog('hours');

        var msg = "Enter\n\n" +
            "'c' for our Class Schedule\n\n" +
            "'o' if you're interested in an Open Gym\n\n" +
            "'n' if you're new to CrossFit and I'll help you get started\n\n" +
            "'p' for info about Private Sessions\n\n" +
            "'m' for Main Menu";

        builder.Prompts.text(session, msg);
    },
    function(session, results){
        console.log(results.response);
        switch(results.response){
            case 'c':
                session.beginDialog('classSchedule');
                session.endDialog();
                break;
            case 'o':
                openGymMessage(session);
                session.endDialog();
                break;
            case 'p':
                privatesMessage(session);
                session.endDialog();
                break;
            case 'n':
                session.beginDialog('getStarted');
                break;
            case 'm':
                break;
            default:
                break;
        }
        // session.endDialog();
    }
]);

bot.dialog('classSchedule', [
    function (session, args) {
        classScheduleMessage(session);
    }
]);

bot.dialog('hours', [
    function(session, args){
        hoursMessage(session);
    }
]);

// Membership
bot.dialog('membership', [
    function (session, args) {
        membershipMessage(session);
        session.endDialog();
    }
]);

// DropIns
bot.dialog('dropIns', [
    function (session, args) {
        dropInsMessage(session);

        msg = "Enter\n\n" +
            "'c' for our class schedule\n\n" +
            "'o' if you're interested in an Open Gym\n\n" +
            "'n' if you're new to CrossFit and I'll help you get started\n\n";
            "'m' for Main Menu"
        
        builder.Prompts.text(session, msg);
    },
    function(session, results){
        switch(results.response){
            case 'c':
                session.beginDialog('classSchedule');
                session.endDialog();
                break;
            case 'o':
                openGymMessage(session);
                session.endDialog();
                break;
            case 'n':
                session.beginDialog('getStarted');
                session.endDialog();
                break;
            default:
                break;
        }
    }
]);

// Get Started
bot.dialog('getStarted', [
    function (session, args) {
        fundamentalsMessage(session);
        
        msg = "enter\n\n" +
            "'f' to see our fundamentals class schedule\n\n" +
            "'p' to sign up for private sessions\n\n" +
            "'m' to return to the main menu";
        
        builder.Prompts.text(session, msg);
    },
    function(session, results){
        switch(results.response){
            case 'f':
                session.send(fundamentalsSchedule);
                session.endDialog();
                break;
            case 'p':
                privatesMessage(session);
                session.endDialog();
                break;
            case 'm':
                session.endDialog();
                break;
            default:
                session.endDialog();
                break;
        }

    }
]);

// Visit Us
bot.dialog('visitUs', [
    function (session, args) {
        locationMessage(session);
        session.endDialog();
    }
]);

// About Us
bot.dialog('aboutUs', [
    function (session, args) {
        session.send("About Us");
        session.endDialog();
    }
]);


// ***** variables and functions *******

var standardWeekdayClassSchedule = ['6am', '7am', '8am', '9am', '12-noon', '1:30pm', '4pm', '5pm', '6pm', '7pm', '8pm (except Friday)'];

var fundamentalsSchedule = "**Fundamentals Schedule**\n\n" +
            "* Part 1: Monday, 7pm\n\n" +
            "* Part 2: Wednesday, 7pm\n\n" +
            "* Part 3: Thursday, 7pm";

function hoursMessage(session){
    var msg = "**We are open**\n\n" +
            "* Monday - Friday: 6am - 9pm\n\n" +
            "* Saturday: 9am - 1pm.\n\n" +
            "* Sunday: day of rest"
    session.send(msg);
}

function classScheduleMessage(session){
    var msg = "**Class Schedule**\n\n";
        msg += "* Weekdays: " + standardWeekdayClassSchedule.join(', ') + "\n\n";
        msg += "* Saturday: 9am, 10am, 11am, 12-noon\n\n";
        msg += "* Sunday: closed";
    session.send(msg);

        msg = "**Check out our specialty classes**\n\n";
        msg += "* Endurance: Monday @ 6pm\n\n";
        msg += "* Gymnastics: Tuesday @ 515pm\n\n";
        msg += "* Rowing: Wednesday @ 515pm\n\n";
        msg += "* Olympic Lifting: Monday @ 7pm, Wednesday @ 530pm"
    session.send(msg);
}

function fundamentalsMessage(session){
    var imageUrl = "http://www.reebokcrossfitmiamibeach.net/wp-content/uploads/2013/10/OurProgramFundamentals.jpg";
    var msg = "**Welcome to Crossfit!**\n\n" +
        "To get you started we offer a 3-part series of *fundamentals classes*, designed to " +
        "get you familiar with the movements and our coaching style:\n\n" +
        "* Part 1.  Squat, front squat, and overhead squat\n\n" +
        "* Part 2.  Press, push press, and push jerk\n\n" +
        "* Part 3.  Deadlift, sumo deadlift high pull, clean"
    session.send(msg);

    msg = "After the instructional portion of each class, " +
        "you will go through a *metcon* (metabolic conditioning, the bread and butter of what we do).  " +
        "\n\nEach day we will tackle a different style of workout:\n\n" +
        "* a chipper,\n\n" +
        "* an AMRAP or time priority workout,\n\n" +
        "* and a task priority workout.";
    session.send(msg);

    msg =  "![fundamentals class](" + imageUrl + ")" +
        "In addition to teaching the fundamental lifts and introducing you " +
        "to the various types of workouts we implement, " +
        "we also review equipment used and provide an orientation of the gym.";
    session.send(msg);

    msg = "For the most personalized approach, we offer private sessions that cover " +
        "everything you need to get started ($150).\n\n";
    
    session.send(msg);

}

function membershipMessage(session){
    var msg = "**Membership Plans**\n\n" +
        "* 3-month commitment: $185/month\n\n" +
        "* 6-month commitment: $165/month\n\n" +
        "* 1-year membership: $150/month\n\n";
    session.send(msg);

    msg = "We also offer WOD packs, for greater flexility:\n\n" +
        "* 3-pack, $75\n\n" +
        "* 5-pack, $112.50\n\n" +
        "* 10-pack, $180\n\n";
    session.send(msg);
}

function dropInsMessage(session){
    var msg = "**Drop-Ins**\n\n" +
            "If you're an experienced CrossFitter, feel free to drop-in to any of our classes.  " +
            "Be sure to arrive 15 minutes before class to get set up."
        session.send(msg);

        msg = "Drop-Ins: Pricing\n\n" +
            "* Single session: $30\n" +
            "* 3-pack: $75\n" +
            "* 5-pack: $112.50\n" +
            "* 1-week UNLIMITED: $100";
        session.send(msg);
}

function privatesMessage(session){
    var msg = "Private training can be set up for:\n\n" +
        "* Fundamentals (CrossFit Intros)\n\n" +
        "* CrossFit WODs\n\n" +
        "* Weightlifting or Olympic Lifting\n\n" +
        "* Kettlebell, Endurance, Mobility, and much more."
    session.send(msg);

    msg = "Rates:\n\n" +
        "* 1-hour, $100\n\n" +
        "* 1-hour Condensed Fundamentals Private Session, $150";
    
    session.send(msg);
}

function openGymMessage(session){
    var msg = "**Open Gym**\n\n" +
        "If you're visiting and you'd like to use our facilities rather than take a class, " +
        "we offer an open gym option during times when no class is in session."
    session.send(msg);

    msg = "Please be aware that classes take priority, so open gym hours are very limited in availability.\n\n\n\n" +
        "* Open Gym fee: $30"
    session.send(msg);
}

function locationMessage(session){
    var imgUrl = "http://www.reebokcrossfitmiamibeach.net/wp-content/uploads/2013/10/FreeCLassSecondImage.jpg";
    var msg = "![our box](" + imgUrl + ")" +
        "We're located at:\n\n" +
        "930 Alton Rd\n\n" +
        "Miami Beach, FL 33139"
    session.send(msg);

    return 0;
}