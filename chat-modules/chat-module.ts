import fbapi = require("facebook-chat-api");

export interface ChatModule {
    getMessageType(): ("message" | "event");
    getHelpLine(): string;
    processMessage(api: fbapi.Api, message: fbapi.MessageEvent | fbapi.EventEvent | fbapi.TypEvent, stopListening: () => void, chatModules: ChatModule[]): void;
}
