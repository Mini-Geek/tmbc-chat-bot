import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { IChatModule } from "./chat-module";

export class DebugModule implements IChatModule {
    public msgLevel: string = "debug";

    public getMessageType(): "message" { return "message"; }
    public getHelpLine(): string {
        return "/debug on/off: Enable backend logging of message details";
    }

    public processMessage(api: fbapi.Api, message: fbapi.MessageEvent): void {
        if (message.body && message.body === "/debug on") {
            this.msgLevel = "info";
            api.getThreadInfo(message.threadID, (infoErr, result) => {
                if (infoErr) {
                    winston.error("Error getting thread info", infoErr);
                } else {
                    winston.info("Thread info", result);
                }
            });
            api.sendMessage("Debugging enabled", message.threadID);
        } else if (message.body === "/debug off") {
            this.msgLevel = "debug";
            api.sendMessage("Debugging disabled", message.threadID);
        }
    }
}
