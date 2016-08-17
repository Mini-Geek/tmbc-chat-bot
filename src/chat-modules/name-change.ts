import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { Utils } from "../utils";
import { IChatModule } from "./chat-module";
import { groups } from "./groups";

export class NameChangeModule implements IChatModule {
    public getMessageType(): string { return "event"; }
    public getHelpLine(threadID: string): string {
        let entry = groups[threadID];
        if (entry && entry.preferredTitle) {
            return `Will keep the chat title at ${entry.preferredTitle}`;
        }
    }

    public processMessage(api: fbapi.Api, message: fbapi.EventEvent): void {
        let entry = groups[message.threadID];
        if (entry && entry.preferredTitle) {
            if (message.logMessageType === "log:thread-name") {
                winston.info("title set to", message.logMessageData.name);
                if (message.logMessageData.name !== entry.preferredTitle) {
                    winston.info("Changing title to " + entry.preferredTitle);
                    api.setTitle(entry.preferredTitle, message.threadID);
                    let i = message.logMessageBody.indexOf(" named the group ");
                    if (i > 0) {
                        let user = message.logMessageBody.substring(0, i);
                        Utils.sendMessage(api, message, "Don't rename the chat, " + user);
                    }
                }
            }
        }
    }
}
