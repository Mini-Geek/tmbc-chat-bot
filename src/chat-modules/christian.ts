import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

export class ChristianModule extends MessageModule {
    public getHelpLine(): string {
        return "/christian: announce when something is–";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body) {
            let body = ctx.message.body.toLowerCase();
            if (body.indexOf("/christian") > -1) {
                Utils.sendMessage(ctx, "IT'S CHR" + this.repeat("I", 11) + "ISTII" + this.repeat("A", 29) + "N");
            } else if (body.indexOf("/notchristian") > -1) {
                Utils.sendMessage(ctx, "IT'S NOT CHR" + this.repeat("I", 11) + "ISTII" + this.repeat("A", 29) + "N");
            } else if (body.indexOf("/kristen") > -1) {
                Utils.sendMessage(ctx, "IT'S KR" + this.repeat("I", 11) + "IST" + this.repeat("E", 31) + "N");
            } else if (body.indexOf("/kristin") > -1) {
                Utils.sendMessage(ctx, "IT'S NOT KR" + this.repeat("I", 11) + "IST" + this.repeat("I", 31) + "N");
            }
        }
    }

    private repeat(s: string, n: number): string {
        return Array(n).join(s);
    }
}
