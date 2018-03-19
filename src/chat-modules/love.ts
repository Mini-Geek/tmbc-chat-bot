import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

export class LoveModule extends MessageModule {
    private ilyPattern: RegExp = new RegExp("^I love (y'?a'?ll|you(|s|se))\\b", "i");
    private petNames: string[] = [
        "010010110100100101001100010011000010000001000001010011000100" +
        "110000100000010010000101010101001101010000010100111001010011",
        "babe-honey",
        "because your neck is like the tower of David, built in rows of stone",
        "darlin'",
        "good lookin'",
        "hon-baby",
        "honey bun",
        "infant human",
        "my beloved",
        "my lily among brambles",
        "my sister*, my bride**\n*or brother\n**or bridegroom",
        "sweet thang",
    ];
    public getHelpLine(): string {
        return "";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body && this.ilyPattern.test(ctx.message.body)) {
            let userHash = this.hash(ctx.message.senderID);
            let name = this.petNames[userHash % this.petNames.length];
            Utils.sendMessage(ctx, `I love you too, ${name}`);
        }
    }

    private hash(str: string): number {
        let hash = 0;
        let i: number;
        let chr: number;
        if (str.length === 0) {
            return hash;
        }
        /* tslint:disable:no-bitwise
           taken from https://stackoverflow.com/a/7616484/781792 */
        for (i = 0; i < str.length; i++) {
          chr   = str.charCodeAt(i);
          hash  = ((hash << 5) - hash) + chr;
          hash |= 0; // Convert to 32bit integer
        }
        if (hash < 0) {
            hash = -hash;
        }
        return hash;
      };
}
