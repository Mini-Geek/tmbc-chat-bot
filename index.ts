import login = require("facebook-chat-api");
import creds = require("./credentials");
import { ChatModule } from "./chat-modules/chat-module";
import { NameChangeModule } from "./chat-modules/name-change";
import { EmojiChangeModule } from "./chat-modules/emoji-change";
import { CountModule } from "./chat-modules/count";
import { ChaterinaInteractionModule } from "./chat-modules/chaterina";
import { SleepModule } from "./chat-modules/sleep";
import { HelpModule } from "./chat-modules/help";
import { BrowseModule } from "./chat-modules/browse";

let chatModules: ChatModule[] = [
    new HelpModule(),
    new CountModule(),
    new SleepModule(),
    new BrowseModule(),
    new ChaterinaInteractionModule(),
    new NameChangeModule(),
    new EmojiChangeModule(),
];
if (!creds || !creds.credentials || !creds.credentials.email || creds.credentials.email === "<FILL IN>") {
    console.error("Please fill in credentials.ts with the account's email and password.");
    process.exit();
}

login(creds.credentials, function callback(err, api) {
    if (err) {
        return console.error(err);
    }
    api.setOptions({ listenEvents: true });

    var stopListening = api.listen(function callback(err, message) {
        // console.log("full message", message);
        if (!message) {
            return console.error("message falsy");
        }
        if (!message.threadID) {
            return console.error("no threadID");
        }
        chatModules.forEach(m => {
            if (m.getMessageType() === message.type) {
                m.processMessage(api, message, stopListening, chatModules);
            }
        });
    });
});
