import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { IChatModule } from "./chat-module";

export class DebugModule implements IChatModule {
    private debugEnabled = false;

    public getMessageType(): string { return "all"; }
    public getHelpLine(): string {
        return "/debug on/off: Enable backend logging of message details";
    }

    public processMessage(api: fbapi.Api, message: fbapi.MessageEvent): void {
        if (this.debugEnabled) {
            winston.info("Full message details", message);
        }
        if (message.type === "message" && message.body) {
            if (message.body === "/debug on") {
                winston.info("Enabling debugging, getting thread info");
                this.debugEnabled = true;
                api.getThreadInfo(message.threadID, (infoErr, result) => {
                    if (infoErr) {
                        winston.error("Error getting thread info", infoErr);
                    } else {
                        winston.info("Thread info", result);
                    }
                });
                api.sendMessage("Debugging enabled", message.threadID);
            } else if (message.body === "/debug off") {
                this.debugEnabled = false;
                api.sendMessage("Debugging disabled", message.threadID);
            }
        }
    }
}
