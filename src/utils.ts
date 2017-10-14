import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { AnyEvent, IContext } from "./chat-modules/chat-module";

export class Utils {
    /**
     * Logs and sends a message using ctx to simplify things.
     */
    public static sendMessage(
        ctx: IContext<AnyEvent>,
        yourMessage: string,
        threadId: string = ctx.message.threadID): void {
        Utils.sendMessageDirect(ctx.api, yourMessage, threadId, ctx.message);
    }

    /**
     * Logs and sends a message with explicitly-specified details.
     */
    public static sendMessageDirect(
        api: fbapi.Api,
        yourMessage: string,
        threadId: string,
        messageReason: any): void {
        winston.info(`Sending ${yourMessage} to ${threadId} in response to this:`, messageReason);
        api.sendMessage(yourMessage, threadId);
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
