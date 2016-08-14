import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { Utils } from "../utils";
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
                Utils.sendMessage(api, message, "Debugging enabled");
            } else if (message.body === "/debug off") {
                this.debugEnabled = false;
                Utils.sendMessage(api, message, "Debugging disabled");
            }
        }
    }
}
