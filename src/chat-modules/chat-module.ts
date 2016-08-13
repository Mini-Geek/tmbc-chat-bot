import fbapi = require("facebook-chat-api");

export interface IChatModule {
    /**
     * "message" | "event" | "typ" | "all"
     */
    getMessageType(): string;
    getHelpLine(): string;
    processMessage(
        api: fbapi.Api,
        message: fbapi.MessageEvent | fbapi.EventEvent | fbapi.TypEvent,
        stopListening: () => void,
        chatModules: IChatModule[]): void;
}
