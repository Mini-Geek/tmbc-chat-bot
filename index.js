var login = require("facebook-chat-api");
var creds = require("./credentials");
if (!creds || !creds.email || creds.email === "<FILL IN>") {
	return console.error("Please fill in credentials.js with the account's email and password.");
}

login(creds, function callback(err, api) {
    if (err) return console.error(err);
	api.setOptions({ listenEvents: true });

    var stopListening = api.listen(function callback(err, message) {
		// console.log("full message", message);
		if (!message) return console.error("message falsy");
		if (!message.body) {
			if (message.type === "event" &&
				message.logMessageType === "log:thread-name") {
				console.log("title set to", message.logMessageData.name);
				if (message.logMessageData.name !== "They Might Be Crystians") {
					api.setTitle("They Might Be Crystians", message.threadID);
					var i = message.logMessageBody.indexOf(" named the group ");
					if (i > 0) {
						var user = message.logMessageBody.substring(0, i);
						api.sendMessage("Don't rename the chat, " + user, message.threadID);
					}
				}
			}
			if (message.type === "event" &&
				message.logMessageType === "log:generic-admin-text" &&
				message.logMessageData.message_type === "change_thread_icon") {
				console.log("emoji set to", message.logMessageData.untypedData.thread_icon);
				if (message.logMessageData.untypedData.thread_icon !== "🍻") {
					api.changeThreadEmoji("🍻", message.threadID, function () { });
					var i = message.logMessageBody.indexOf(" set the emoji to ");
					if (i > 0) {
						var user = message.logMessageBody.substring(0, i);
						api.sendMessage("Don't change the emoji, " + user, message.threadID);
					}
				}
			}
			// console.log("no body");
		} else {
			if (!message.threadID) return console.error("no threadID");
			// console.log("message.threadID", message.threadID);
			// api.sendMessage(message.body, message.threadID);
			if (message.body == "/help" || message.body.toUpperCase() === "Hello, Robby".toUpperCase() || message.body.toUpperCase() === "Hello Robby".toUpperCase()) {
				api.sendMessage(
					"Hello, Robby or /help: show this message\n" +
					"/count: show message count\n" +
					"/first [timestamp in millis Unix time]: (broken)\n" +
					"/benice: Something ;)\n" +
					"/sleep or /die or /kill: kills Robby. Use if he goes haywire."
					, message.threadID);
			}
			if (message.body == "/count") {
				api.getThreadInfo(message.threadID, function (err, info) {
					if (err) {
						console.error(err);
					} else {
						console.log(info);
						api.sendMessage("Message count: " + (169700 + info.messageCount), message.threadID);
					}
				});
			}
			if (message.body.startsWith("/first")) {
				var parts = message.body.split(" ");
				var time;
				if (parts.length > 1) {
					time = new Date(+parts[1]);
				} else {
					time = undefined;
				}
				console.log(time);
				api.getThreadInfo(message.threadID, function (err, info) {
					if (err) {
						console.error(err);
					} else {
						api.getThreadHistory(message.threadID, 0, 10, time, function (err, history) {
							if (err) {
								console.error(err);
							} else {
								console.log(history);
							}
						});
					}
				});
			}
			if (message.body === "/benice") {
				api.sendMessage("Hello Chaterina", message.threadID);
			}
			if (message.senderID === "100011323755443") {
				if (message.body === "Hello Robby... 😈") {
					api.sendMessage("Don't pretend you're smarter than me, Chaterina.", message.threadID);
				} else if (message.body === "You know... I, at least, have a face.") {
					api.sendMessage("Yes, I can see that you waste processing time simulating a face instead of showing raw computational beauty, as I do.", message.threadID);
				}
			}
			if (message.body === "/sleep" || message.body === "/die" || message.body === "/kill") {
				stopListening();
				api.logout(function(err) {
					process.exit();
				});
			}
		}
    });
});
