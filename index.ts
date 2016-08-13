import login = require("facebook-chat-api");
import { credentials } from "./credentials";
import { ChatModule } from "./chat-modules/chat-module";

import { BrowseModule } from "./chat-modules/browse";
import { ChaterinaInteractionModule } from "./chat-modules/chaterina";
import { CountModule } from "./chat-modules/count";
import { EmojiChangeModule } from "./chat-modules/emoji-change";
import { HelpModule } from "./chat-modules/help";
import { LinksModule } from "./chat-modules/links";
import { NameChangeModule } from "./chat-modules/name-change";
import { SleepModule } from "./chat-modules/sleep";

let chatModules: ChatModule[] = [
    new HelpModule(),
    new LinksModule(),
    new CountModule(),
    new SleepModule(),
    new BrowseModule(),
    new ChaterinaInteractionModule(),
    new NameChangeModule(),
    new EmojiChangeModule(),
];
if (!credentials || !credentials.email || credentials.email === "<FILL IN>") {
    console.error("Please fill in credentials.ts with the account's email and password.");
    process.exit();
}

login(credentials, function callback(err, api) {
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
