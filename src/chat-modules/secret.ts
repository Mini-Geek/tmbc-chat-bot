import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";
import { regexNamePattern } from "./const";

/**
 * Easter egg: quotes from Person of Interest, season 3 finale.
 */
export class SecretModule extends MessageModule {
    private greeted = false;
    private firstPattern: RegExp = new RegExp("^Good (morning|afternoon|evening|day),? " +
                                                regexNamePattern + "[\!\.\?]?$", "i");
    private secondPattern: RegExp = new RegExp("^(The question is,?\s*)?what(,? my dear " +
                                                regexNamePattern + ",?)? are your commands for us\??$", "i");
    public getHelpLine(): string {
        return undefined;
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body) {
            // Good morning.
            // (I assure you, it's quite the other way around\.)?\s*
            // I assure you, it's quite the other way around.
            // The question is what, my dear Samaritan, are your commands for us?
            if (this.firstPattern.test(ctx.message.body)) {
                Utils.sendMessage(ctx, "What are your commands?");
                this.greeted = true;
            } else if (this.greeted && this.secondPattern.test(ctx.message.body)) {
                setTimeout(() => {
                    Utils.sendMessage(ctx, "Calculating response");
                }, 1500);
                this.greeted = false;
            }
        }
    }
}
