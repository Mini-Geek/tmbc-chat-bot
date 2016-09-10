import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

export class YouTubeLinksModule extends MessageModule {
    private fbPattern: RegExp = /https?:\/\/l\.facebook\.com\/l\.php\?u=([^&\ ]+)/i;
    // large regex is easiest as one big line
    // tslint:disable-next-line:max-line-length
    private ytPattern: RegExp = /(?:https?:\/\/|\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})(?![\w-])\/?(?:[?&]t=([0-9hms]+))?/i;
    public getHelpLine(): string {
        return `Converts YouTube links to mobile format (for mom)`;
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        let msg = ctx.message.body;
        if (msg) {
            let fbMatches = this.fbPattern.exec(msg);
            if (fbMatches) {
                let urlParam = fbMatches[1];
                msg = decodeURIComponent(urlParam);
            }
            let ytMatches = this.ytPattern.exec(msg);
            if (ytMatches) {
                let id = ytMatches[1];
                let time = ytMatches[2];
                Utils.sendMessage(ctx, `https://m.youtube.com/watch?v=${id}${time ? "&t=" + time : ""}`);
            }
        }
    }
}
