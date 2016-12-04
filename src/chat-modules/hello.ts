import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";
import { regexNamePattern, userFriendlyName } from "./const";

export class HelloModule extends MessageModule {
    private helloPattern: RegExp = new RegExp("^(Hello|hi|hey),? " + regexNamePattern + "[\\!\\.\\?]?$", "i");
    private thanksPattern: RegExp = new RegExp("^(Thanks|thank you|thank-you),? " +
                                                regexNamePattern + "[\\!\\.\\?]?$", "i");
    public getHelpLine(): string {
        return `Hello, ${userFriendlyName}: say hello`;
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body && this.helloPattern.test(ctx.message.body)) {
            Utils.sendMessage(ctx, "Hello");
        }
        if (ctx.message.body && this.thanksPattern.test(ctx.message.body)) {
            Utils.sendMessage(ctx, "You're welcome!");
        }
    }
}
