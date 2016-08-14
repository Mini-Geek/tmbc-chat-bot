import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { IChatModule } from "./chat-module";

export class SleepModule implements IChatModule {
    public getMessageType(): string { return "message"; }
    public getHelpLine(): string {
        return "/sleep or /die or /kill: kills Robby. Use if he goes haywire.";
    }

    public processMessage(api: fbapi.Api, message: fbapi.MessageEvent, shutdown: (reason: string) => void): void {
        if (message.body === "/sleep" || message.body === "/die" || message.body === "/kill") {
            winston.warn("Shutting down due to command", message);
            shutdown(message.body + " command sent, shutting down");
        }
    }
}
