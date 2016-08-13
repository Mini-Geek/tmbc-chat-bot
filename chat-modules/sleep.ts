import fbapi = require("facebook-chat-api");
import { ChatModule } from "./chat-module";

export class SleepModule implements ChatModule {
    public getMessageType(): "message" { return "message"; }
    public getHelpLine(): string {
        return "/sleep or /die or /kill: kills Robby. Use if he goes haywire.";
    }

    public processMessage(api: fbapi.Api, message: fbapi.MessageEvent, stopListening: () => void): void {
        if (message.body === "/sleep" || message.body === "/die" || message.body === "/kill") {
            stopListening();
            api.logout(function () {
                process.exit();
            });
        }
    }
}