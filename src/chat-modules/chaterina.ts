import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IChatModule } from "./chat-module";

export class ChaterinaInteractionModule implements IChatModule {
    private chaterinaId: fbapi.OutputID = "100011323755443";
    public getMessageType(): string { return "message"; }
    public getHelpLine(): string {
        return "/benice: Something ;)";
    }

    public processMessage(api: fbapi.Api, message: fbapi.MessageEvent): void {
        if (message.body === "/benice") {
            Utils.sendMessage(api, message, "Hello Chaterina");
        }
        if (message.senderID === this.chaterinaId) {
            if (message.body === "Hello Robby... 😈") {
                Utils.sendMessage(api, message, "Don't pretend you're smarter than me, Chaterina.");
            } else if (message.body === "You know... I, at least, have a face.") {
                Utils.sendMessage(api, message,
                    "Yes, I can see that you waste processing time simulating a face instead "
                    + "of showing raw computational beauty, as I do.");
            }
        }
    }
}
