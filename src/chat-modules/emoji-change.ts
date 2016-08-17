import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { Utils } from "../utils";
import { IChatModule } from "./chat-module";
import { groups } from "./groups";

export class EmojiChangeModule implements IChatModule {
    public getMessageType(): string { return "event"; }
    public getHelpLine(threadID: string): string {
        let entry = groups[threadID];
        if (entry && entry.preferredEmoji) {
            return `Will keep the emoji at ${entry.preferredEmoji}`;
        }
    }

    public processMessage(api: fbapi.Api, message: fbapi.EventEvent): void {
        let entry = groups[message.threadID];
        if (entry && entry.preferredEmoji) {
            if (message.logMessageType === "log:generic-admin-text" &&
                message.logMessageData.message_type === "change_thread_icon") {
                winston.info("emoji set to", message.logMessageData.untypedData.thread_icon);
                if (message.logMessageData.untypedData.thread_icon !== entry.preferredEmoji) {
                    winston.info("Changing emoji to " + entry.preferredEmoji);
                    api.changeThreadEmoji(entry.preferredEmoji, message.threadID, () => undefined);
                    let i = message.logMessageBody.indexOf(" set the emoji to ");
                    if (i > 0) {
                        let user = message.logMessageBody.substring(0, i);
                        Utils.sendMessage(api, message, "Don't change the emoji, " + user);
                    }
                }
            }
        }
    }
}
