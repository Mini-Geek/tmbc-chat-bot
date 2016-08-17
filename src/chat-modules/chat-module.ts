import fbapi = require("facebook-chat-api");

export interface IChatModule {
    /**
     * "message" | "event" | "typ" | "all"
     */
    getMessageType(): string;
    getHelpLine(threadID: string): string;
    processMessage(
        api: fbapi.Api,
        message: fbapi.MessageEvent | fbapi.EventEvent | fbapi.TypEvent,
        shutdown: (reason: string) => void,
        chatModules: IChatModule[]): void;
}
