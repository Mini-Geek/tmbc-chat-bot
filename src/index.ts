import login = require("facebook-chat-api");
import winston = require("winston");
import "winston-daily-rotate-file";
import { credentials } from "./credentials";

import { AdminModule } from "./chat-modules/admin";
import { AvocadoModule } from "./chat-modules/avocado";
import { AnyEvent, IChatModule, IContext } from "./chat-modules/chat-module";
import { ChristianModule } from "./chat-modules/christian";
import { DieModule } from "./chat-modules/die";
import { HelloModule } from "./chat-modules/hello";
import { HelpModule } from "./chat-modules/help";
import { LinksModule } from "./chat-modules/links";
import { LoveModule } from "./chat-modules/love";
// import { SearchModule } from "./chat-modules/search";
import { SecretModule } from "./chat-modules/secret";
import { SayModule } from "./chat-modules/see-n-say";
import { ShrugModule } from "./chat-modules/shrug";
import { SleepModule } from "./chat-modules/sleep";
import { StalkerModule } from "./chat-modules/stalker";
import { StorageModule } from "./chat-modules/storage";
import { VideosModule } from "./chat-modules/videos";

winston.add(
    winston.transports.DailyRotateFile,
    {
        datePattern: "yyyy-MM.",
        filename: "logs/chat-bot.log",
        level: "info",
        prepend: true,
    });
winston.warn("starting up!");

StorageModule.init();
const videosModule = new VideosModule();
const sleepModule = new SleepModule();
let sleeping = false;
let chatModules: Array<IChatModule<AnyEvent>> = [
    new HelpModule(),
    new HelloModule(),
    new LinksModule(),
    new AdminModule(),
    new ChristianModule(),
    sleepModule,
    new DieModule(),
    new SecretModule(),
    // new SearchModule(),
    new SayModule(),
    new ShrugModule(),
    new StalkerModule(),
    new AvocadoModule(),
    videosModule,
    new LoveModule(),
];
if (!credentials || !credentials.email || credentials.email === "<FILL IN>") {
    winston.error("Please fill in credentials.ts with the account's email and password.");
    process.exit();
}
if (credentials.selfOnly) {
    chatModules = chatModules.filter((m) => m.handleSelf());
}

const runLogin = () => login(credentials, (loginErr, api) => {
    if (loginErr) {
        return winston.error("Error logging in", loginErr);
    }
    const myUserId = api.getCurrentUserID();
    api.setOptions({ listenEvents: true, selfListen: true });

    const stopListening = api.listen((listenErr, message) => {
        if (listenErr) {
            return winston.error("Error listening", listenErr);
        }
        if (!message) {
            return winston.error("message falsy");
        }
        if (!message.threadID) {
            return winston.error("no threadID");
        }
        const ctx: IContext<any> = {
            api,
            chatModules,
            message,
            setSleep,
            shutdown,
            sleeping,
        };
        if (sleeping) {
            if (messageCheck(sleepModule, message)) {
                sleepModule.processMessage(ctx);
            }
        } else {
            chatModules.forEach((m) => {
                if (messageCheck(m, message)) {
                    m.processMessage(ctx);
                }
            });
        }
    });

    const shutdown = (reason: string) => {
        winston.warn(reason);
        stopListening();
        clearInterval(videoRepeater);
        api.logout(() => process.exit(0));
    };
    const setSleep = (s: boolean) => {
        sleeping = s;
    };
    const messageCheck = (m: IChatModule<AnyEvent>, ev: login.Event): boolean => {
        return messageTypeMatch(m, ev.type) && selfCheck(m, ev);
    };
    const messageTypeMatch = (m: IChatModule<AnyEvent>, type: string): boolean => {
        return m.getMessageType() === "all" || m.getMessageType() === type;
    };
    const selfCheck = (m: IChatModule<AnyEvent>, ev: login.Event): boolean => {
        if (m.handleSelf()) { return true; }

        const msg = ev as login.MessageEvent;
        if (msg.senderID && msg.senderID === myUserId) {
            return false;
        } else {
            return true;
        }
    };
    const sigintCallback = () => shutdown("SIGINT detected, logging out");
    process.on("SIGINT", sigintCallback);
    setTimeout(() => {
        process.removeListener("SIGINT", sigintCallback);
        winston.info("Logging out and in to keep the connection fresh");
        clearInterval(videoRepeater);
        stopListening();
        api.logout(() => runLogin());
    }, 86400 * 1000); // 24 hours
    const videoRepeater = setInterval(() => {
        videosModule.autoCheck(api);
    }, 300 * 1000); // 5 minutes
});
runLogin();
