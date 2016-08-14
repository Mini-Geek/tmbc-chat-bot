import fbapi = require("facebook-chat-api");
import winston = require("winston");

export class Utils {
    /**
     * Logs and sends a message.
     */
    public static sendMessage(
        api: fbapi.Api,
        fbMessage: fbapi.MessageEvent | fbapi.EventEvent | fbapi.TypEvent,
        yourMessage: string): void {
        winston.info(`Sending ${yourMessage} in response to this:`, fbMessage);
        api.sendMessage(yourMessage, fbMessage.threadID);
    }
}
