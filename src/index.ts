import login = require("facebook-chat-api");
import winston = require("winston");
import { credentials } from "./credentials";

import { BrowseModule } from "./chat-modules/browse";
import { IChatModule } from "./chat-modules/chat-module";
import { ChaterinaInteractionModule } from "./chat-modules/chaterina";
import { CountModule } from "./chat-modules/count";
import { DebugModule } from "./chat-modules/debug";
import { EmojiChangeModule } from "./chat-modules/emoji-change";
import { HelloModule } from "./chat-modules/hello";
import { HelpModule } from "./chat-modules/help";
import { LinksModule } from "./chat-modules/links";
import { NameChangeModule } from "./chat-modules/name-change";
import { SleepModule } from "./chat-modules/sleep";

let chatModules: IChatModule[] = [
    new HelpModule(),
    new HelloModule(),
    new LinksModule(),
    new CountModule(),
    new DebugModule(),
    new SleepModule(),
    new BrowseModule(),
    new ChaterinaInteractionModule(),
    new NameChangeModule(),
    new EmojiChangeModule(),
];
if (!credentials || !credentials.email || credentials.email === "<FILL IN>") {
    winston.error("Please fill in credentials.ts with the account's email and password.");
    process.exit();
}

login(credentials, function callback(loginErr, api) {
    if (loginErr) {
        return winston.error("Error logging in", loginErr);
    }
    api.setOptions({ listenEvents: true });

    let stopListening = api.listen(function callback(listenErr, message) {
        if (listenErr) {
            return winston.error("Error listening", listenErr);
        }
        if (!message) {
            return winston.error("message falsy");
        }
        if (!message.threadID) {
            return winston.error("no threadID");
        }
        chatModules.forEach(m => {
            if (m.getMessageType() === "all" || m.getMessageType() === message.type) {
                m.processMessage(api, message, stopListening, chatModules);
            }
        });
    });
});
