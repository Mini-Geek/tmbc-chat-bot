import fbapi = require("facebook-chat-api");
import { IChatModule } from "./chat-module";

export class ChaterinaInteractionModule implements IChatModule {
    private chaterinaId: fbapi.OutputID = "100011323755443";
    public getMessageType(): string { return "message"; }
    public getHelpLine(): string {
        return "/benice: Something ;)";
    }

    public processMessage(api: fbapi.Api, message: fbapi.MessageEvent): void {
        if (message.body === "/benice") {
            api.sendMessage("Hello Chaterina", message.threadID);
        }
        if (message.senderID === this.chaterinaId) {
            if (message.body === "Hello Robby... 😈") {
                api.sendMessage("Don't pretend you're smarter than me, Chaterina.", message.threadID);
            } else if (message.body === "You know... I, at least, have a face.") {
                api.sendMessage("Yes, I can see that you waste processing time simulating a face instead "
                    + "of showing raw computational beauty, as I do.", message.threadID);
            }
        }
    }
}
