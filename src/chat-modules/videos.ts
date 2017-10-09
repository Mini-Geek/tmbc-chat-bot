import fbapi = require("facebook-chat-api");
import https = require("https");
import storage = require("node-persist");
import winston = require("winston");
import { credentials } from "../credentials";
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

export class VideosModule extends MessageModule {
    private channelIds: string[] = [
        "UC0jIctUPBK6lHw4AYnGHvCA", // Blimey Cow
        "UCUgSn3_q1PF6RcPHkuVHFHA", // Jordan Taylor
        "UCWKvCiwesNEBLNioZfrB5mQ", // Say Goodnight Kevin
        "UC9rIUAMjXWvt4Gs-Nwn7cig", // Pun Diddley
    ];
    private storageInitialized = false;

    public constructor() {
        super();
        storage.init({ dir: "../../../../videocheck-data" }, () => {
            this.storageInitialized = true;
        });
    }
    public getHelpLine(): string {
        return "/videocheck: Sends links for any recent Blimey Cow (and related) videos " +
                "(also runs automatically every 5 minutes)";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (this.storageInitialized && ctx.message.body === "/videocheck") {
            this.runCheck(ctx.api, ctx.message.threadID, false, ctx.message);
        }
    }

    public autoCheck(api: fbapi.Api): void {
        winston.info("Auto-checking for new videos");
        this.runCheck(api, "890328284337788", true, undefined); // thread ID is tmbc
    }

    private runCheck(api: fbapi.Api, threadID: string, isAuto: boolean, message: fbapi.MessageEvent): void {
        let messageReason = isAuto ? "automatic timer" : message;
        let anyChannelDataDirty = false;
        let channelsDone = 0;
        this.channelIds.forEach(channelId => {
            const req = https.get({
                host: "www.googleapis.com",
                path: "/youtube/v3/search?part=snippet&type=video&channelId=" +
                        `${channelId}&order=date&key=${credentials.youtubeApiKey}`,
            }, res => {
                let body = "";
                res.on("data", (data: string) => {
                    body += data;
                });
                res.on("end", () => {
                    let data: IStoredData = storage.getItemSync("data.json") || {};
                    if (!data.hasOwnProperty(threadID)) {
                        data[threadID] = [];
                    }
                    let channelDataDirty = false;
                    let bodyJson = JSON.parse(body);
                    bodyJson.items.forEach((item: IYouTubeSearchItem) => {
                        if (item.id && item.id.videoId) {
                            if (data[threadID].indexOf(item.id.videoId) === -1) {
                                const msg = `New ${item.snippet.channelTitle} video "${item.snippet.title}": ` +
                                            `https://youtu.be/${item.id.videoId}`;
                                Utils.sendMessageDirect(api, msg, threadID, messageReason);
                                data[threadID].push(item.id.videoId);
                                channelDataDirty = true;
                            }
                        }
                    });
                    if (channelDataDirty) {
                        storage.setItemSync("data.json", data);
                        anyChannelDataDirty = true;
                    }
                    channelsDone++;
                    if (channelsDone === this.channelIds.length && !anyChannelDataDirty) {
                        if (!isAuto) {
                            Utils.sendMessageDirect(api, "No new videos to report.", threadID, messageReason);
                        }
                    }
                });
            });
            req.on("error", (e: any) => {
                winston.error("Error making YouTube API request.", e);
                if (!isAuto) {
                    Utils.sendMessageDirect(api, "Sorry, I can't talk to YouTube", threadID, messageReason);
                }
            });
            req.end();
        });
    }
}
interface IStoredData {
    [threadId: string]: string[];
}
interface IYouTubeSearchItem {
    id: { kind: string, videoId: string };
    snippet: { title: string, description: string, channelTitle: string };
}
