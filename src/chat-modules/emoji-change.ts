import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { Utils } from "../utils";
import { IChatModule } from "./chat-module";

export class EmojiChangeModule implements IChatModule {
    private preferredEmoji: string = "🍻";
    public getMessageType(): string { return "event"; }
    public getHelpLine(): string {
        return `Will keep the emoji at ${this.preferredEmoji}`;
    }

    public processMessage(api: fbapi.Api, message: fbapi.EventEvent): void {
        if (message.logMessageType === "log:generic-admin-text" &&
            message.logMessageData.message_type === "change_thread_icon") {
            winston.info("emoji set to", message.logMessageData.untypedData.thread_icon);
            if (message.logMessageData.untypedData.thread_icon !== this.preferredEmoji) {
                winston.info("Changing emoji to " + this.preferredEmoji);
                api.changeThreadEmoji(this.preferredEmoji, message.threadID, () => undefined);
                let i = message.logMessageBody.indexOf(" set the emoji to ");
                if (i > 0) {
                    let user = message.logMessageBody.substring(0, i);
                    Utils.sendMessage(api, message, "Don't change the emoji, " + user);
                }
            }
        }
    }
}
