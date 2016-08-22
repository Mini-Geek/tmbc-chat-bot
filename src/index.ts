import login = require("facebook-chat-api");
import winston = require("winston");
import { credentials } from "./credentials";

import { AnyEvent, IChatModule, IContext } from "./chat-modules/chat-module";
import { ChaterinaInteractionModule } from "./chat-modules/chaterina";
import { CountModule } from "./chat-modules/count";
import { DebugModule } from "./chat-modules/debug";
import { DieModule } from "./chat-modules/die";
import { EmojiChangeModule } from "./chat-modules/emoji-change";
import { HelloModule } from "./chat-modules/hello";
import { HelpModule } from "./chat-modules/help";
import { LinksModule } from "./chat-modules/links";
import { NameChangeModule } from "./chat-modules/name-change";
import { SecretModule } from "./chat-modules/secret";
import { SleepModule } from "./chat-modules/sleep";

winston.add(
    winston.transports.File,
    {
        filename: "logs/chat-bot.log",
        level: "warn",
    });
winston.warn("starting up!");

let sleepModule = new SleepModule();
let sleeping = false;
let chatModules: IChatModule<AnyEvent>[] = [
    new HelpModule(),
    new HelloModule(),
    new LinksModule(),
    new CountModule(),
    new DebugModule(),
    sleepModule,
    new DieModule(),
    new ChaterinaInteractionModule(),
    new SecretModule(),
    new NameChangeModule(),
    new EmojiChangeModule(),
];
if (!credentials || !credentials.email || credentials.email === "<FILL IN>") {
    winston.error("Please fill in credentials.ts with the account's email and password.");
    process.exit();
}

login(credentials, (loginErr, api) => {
    if (loginErr) {
        return winston.error("Error logging in", loginErr);
    }
    api.setOptions({ listenEvents: true });

    let stopListening = api.listen((listenErr, message) => {
        if (listenErr) {
            return winston.error("Error listening", listenErr);
        }
        if (!message) {
            return winston.error("message falsy");
        }
        if (!message.threadID) {
            return winston.error("no threadID");
        }
        let ctx: IContext<any> = {
                api: api,
                chatModules: chatModules,
                message: message,
                setSleep: setSleep,
                shutdown: shutdown,
                sleeping: sleeping,
            };
        if (sleeping) {
            if (messageTypeMatch(sleepModule, message.type)) {
                sleepModule.processMessage(ctx);
            }
        } else {
            chatModules.forEach(m => {
                if (messageTypeMatch(m, message.type)) {
                    m.processMessage(ctx);
                }
            });
        }
    });

    let shutdown = (reason: string) => {
        winston.warn(reason);
        stopListening();
        api.logout(() => process.exit(0));
    };
    let setSleep = (s: boolean) => {
        sleeping = s;
    };
    let messageTypeMatch = (m: IChatModule<any>, type: string): boolean => {
        return m.getMessageType() === "all" || m.getMessageType() === type;
    };
    process.on("SIGINT", () => {
        shutdown("SIGINT detected, logging out");
    });
});
