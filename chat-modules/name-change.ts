import fbapi = require("facebook-chat-api");
import { ChatModule } from "./chat-module";

export class NameChangeModule implements ChatModule {
    private preferredTitle: string = "They Might Be Crystians";
    public getMessageType(): "event" { return "event"; }
    public getHelpLine(): string {
        return `Will keep the chat title at ${this.preferredTitle}`;
    }

    public processMessage(api: fbapi.Api, message: fbapi.EventEvent): void {
        if (message.logMessageType === "log:thread-name") {
            console.log("title set to", message.logMessageData.name);
            if (message.logMessageData.name !== this.preferredTitle) {
                api.setTitle(this.preferredTitle, message.threadID);
                var i = message.logMessageBody.indexOf(" named the group ");
                if (i > 0) {
                    var user = message.logMessageBody.substring(0, i);
                    api.sendMessage("Don't rename the chat, " + user, message.threadID);
                }
            }
        }
    }
}
