import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { AnyEvent, IContext } from "./chat-modules/chat-module";

export class Utils {
    /**
     * Logs and sends a message.
     */
    public static sendMessage(
        ctx: IContext<AnyEvent>,
        yourMessage: string): void {
        winston.info(`Sending ${yourMessage} in response to this:`, ctx.message);
        ctx.api.sendMessage(yourMessage, ctx.message.threadID);
    }

    public static isMessage(event: AnyEvent): event is fbapi.MessageEvent {
        return event.type === "message";
    }
    public static isEvent(event: AnyEvent): event is fbapi.EventEvent {
        return event.type === "event";
    }
    public static isTyp(event: AnyEvent): event is fbapi.TypEvent {
        return event.type === "typ";
    }
}
