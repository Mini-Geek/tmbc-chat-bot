import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { IContext, MessageModule } from "./chat-module";
import { userFriendlyName } from "./const";

export class DieModule extends MessageModule {
    public getHelpLine(): string {
        return `/die or /kill: kills ${userFriendlyName}. Use if he goes haywire.`;
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body === "/die" || ctx.message.body === "/kill") {
            ctx.messageHandled = true;
            winston.warn("Shutting down due to command", ctx.message);
            ctx.shutdown(ctx.message.body + " command sent, shutting down");
        }
    }
}
