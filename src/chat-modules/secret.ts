import fbapi = require("facebook-chat-api");
import { Utils } from "../utils";
import { IChatModule } from "./chat-module";

/**
 * Easter egg: quotes from Person of Interest, season 3 finale.
 */
export class SecretModule implements IChatModule {
    private greeted = false;
    private firstPattern: RegExp = /^Good (morning|afternoon|evening|day),? Robby( A[sz]imov)?[\!\.\?]?$/i;
    private secondPattern: RegExp = /^(The question is,?\s*)?what(,? my dear Robby,?)? are your commands for us\??$/i;
    public getMessageType(): string { return "message"; }
    public getHelpLine(): string {
        return undefined;
    }

    public processMessage(api: fbapi.Api, message: fbapi.MessageEvent): void {
        if (message.body) {
            // Good morning.
            // (I assure you, it's quite the other way around\.)?\s*
            // I assure you, it's quite the other way around.
            // The question is what, my dear Samaritan, are your commands for us?
            if (this.firstPattern.test(message.body)) {
                Utils.sendMessage(api, message, "What are your commands?");
                this.greeted = true;
            } else if (this.greeted && this.secondPattern.test(message.body)) {
                setTimeout(() => {
                    Utils.sendMessage(api, message, "Calculating response");
                }, 1500);
                this.greeted = false;
            }
        }
    }
}
