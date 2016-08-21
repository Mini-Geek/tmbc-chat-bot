import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

export const ChaterinaId: fbapi.OutputID = "100011323755443";

export class ChaterinaInteractionModule extends MessageModule {
    public getHelpLine(): string {
        return "/benice: Something ;)";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body === "/benice") {
            Utils.sendMessage(ctx, "Hello Chaterina");
        }
    }
}
