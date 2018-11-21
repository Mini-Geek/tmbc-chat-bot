import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { AnyEvent, IContext } from "./chat-modules/chat-module";
import { groups } from "./chat-modules/const";

export class Utils {
    /**
     * Logs and sends a message using ctx to simplify things.
     */
    public static sendMessage(
        ctx: IContext<AnyEvent>,
        yourMessage: string,
        threadId: string = ctx.message.threadID): void {
        Utils.sendMessageDirect(ctx.api, yourMessage, threadId, ctx.message);
        ctx.messageHandled = true;
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

    public static getThreadIdFromInput(thread: string, currentThreadId: string): string {
        if (isNaN(+thread)) {
            // try to look up value
            const converted = this.getByStrId(thread);
            // if found, use target one
            // if not found, assume it's going to current thread
            thread = converted ? converted : currentThreadId;
        } else {
            // it's a number, assume that's the thread id
            thread = thread;
        }
        return thread;
    }

    private static getByStrId(strId: string): string {
        for (const key in groups) {
            if (groups.hasOwnProperty(key)) {
                const element = groups[key];
                if (element.threadStrId === strId) {
                    return key;
                }
            }
        }
        return undefined;
    }
}
