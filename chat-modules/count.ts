import fbapi = require("facebook-chat-api");
import { ChatModule } from "./chat-module";

export class CountModule implements ChatModule {
    public getMessageType(): "message" { return "message"; }
    public getHelpLine(): string {
        return "/count: show message count";
    }

    public processMessage(api: fbapi.Api, message: fbapi.MessageEvent): void {
        if (message.body === "/count") {
            api.getThreadInfo(message.threadID, function (err, info) {
                if (err) {
                    console.error(err);
                } else {
                    console.log(info);
                    api.sendMessage("Message count: " + (169700 + info.messageCount), message.threadID);
                }
            });
        }
    }
}
