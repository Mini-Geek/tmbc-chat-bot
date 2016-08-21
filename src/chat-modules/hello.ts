import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

export class HelloModule extends MessageModule {
    private pattern: RegExp = /^(Hello|hi|hey),? Robby( A[sz]imov)?[\!\.\?]?$/i;
    public getHelpLine(): string {
        return "Hello, Robby: say hello";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body && this.pattern.test(ctx.message.body)) {
            Utils.sendMessage(ctx, "Hello");
        }
    }
}
