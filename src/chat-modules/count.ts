import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { Utils } from "../utils";
import { IChatModule } from "./chat-module";

export class CountModule implements IChatModule {
    public getMessageType(): string { return "message"; }
    public getHelpLine(): string {
        return "/count: show message count";
    }

    public processMessage(api: fbapi.Api, message: fbapi.MessageEvent): void {
        if (message.body === "/count") {
            api.getThreadInfo(message.threadID, (err, info) => {
                if (err) {
                    winston.error("Error occurred getting thread info", err);
                } else {
                    winston.info("Thread info", info);
                    Utils.sendMessage(api, message, "Message count: " + (169700 + info.messageCount));
                }
            });
        }
    }
}
