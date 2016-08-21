import fbapi = require("facebook-chat-api");

export interface IChatModule<T> {
    /**
     * "message" | "event" | "typ" | "all"
     */
    getMessageType(): string;
    getHelpLine(threadID: string): string;
    processMessage(ctx: IContext<T>): void;
}
export interface IContext<T> {
    api: fbapi.Api;
    message: T;
    shutdown: (reason: string) => void;
    setSleep: (sleep: boolean) => void;
    sleeping: boolean;
    chatModules: IChatModule<any>[];
}
export type AnyEvent = fbapi.MessageEvent | fbapi.EventEvent | fbapi.TypEvent;
export abstract class EventModule implements IChatModule<fbapi.EventEvent> {
    public getMessageType(): string { return "event"; }
    public abstract getHelpLine(threadID: string): string;
    public abstract processMessage(ctx: IContext<fbapi.EventEvent>): void;
}
export abstract class MessageModule implements IChatModule<fbapi.MessageEvent> {
    public getMessageType(): string { return "message"; }
    public abstract getHelpLine(threadID: string): string;
    public abstract processMessage(ctx: IContext<fbapi.MessageEvent>): void;
}
export abstract class TypModule implements IChatModule<fbapi.TypEvent> {
    public getMessageType(): string { return "typ"; }
    public abstract getHelpLine(threadID: string): string;
    public abstract processMessage(ctx: IContext<fbapi.TypEvent>): void;
}
export abstract class AllModule implements IChatModule<AnyEvent> {
    public getMessageType(): string { return "all"; }
    public abstract getHelpLine(threadID: string): string;
    public abstract processMessage(ctx: IContext<AnyEvent>): void;
}
