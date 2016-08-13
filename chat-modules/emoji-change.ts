import fbapi = require("facebook-chat-api");
import { ChatModule } from "./chat-module";

export class EmojiChangeModule implements ChatModule {
    private preferredEmoji: string = "🍻";
    public getMessageType(): "event" { return "event"; }
    public getHelpLine(): string {
        return `Will keep the emoji at ${this.preferredEmoji}`;
    }

    public processMessage(api: fbapi.Api, message: fbapi.EventEvent): void {
            if (message.logMessageType === "log:generic-admin-text" &&
                message.logMessageData.message_type === "change_thread_icon") {
                console.log("emoji set to", message.logMessageData.untypedData.thread_icon);
                if (message.logMessageData.untypedData.thread_icon !== this.preferredEmoji) {
                    api.changeThreadEmoji(this.preferredEmoji, message.threadID, function () { });
                    let i = message.logMessageBody.indexOf(" set the emoji to ");
                    if (i > 0) {
                        let user = message.logMessageBody.substring(0, i);
                        api.sendMessage("Don't change the emoji, " + user, message.threadID);
                    }
                }
            }
    }
}
