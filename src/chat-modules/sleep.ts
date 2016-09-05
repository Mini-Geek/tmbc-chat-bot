import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";
import { userFriendlyName } from "./const";

export class SleepModule extends MessageModule {
    public getHelpLine(): string {
        return `/sleep and /wake: suspends ${userFriendlyName} temporarily, and resumes him.`;
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body === "/sleep" && !ctx.sleeping) {
            Utils.sendMessage(ctx, "Going to sleep until I hear /wake");
            ctx.setSleep(true);
        } else if (ctx.message.body === "/wake" && ctx.sleeping) {
            Utils.sendMessage(ctx, "I'm awake!");
            ctx.setSleep(false);
        }
    }
}
