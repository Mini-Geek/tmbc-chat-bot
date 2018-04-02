import fbapi = require("facebook-chat-api");
import https = require("https");
import storage = require("node-persist");
import winston = require("winston");
import { credentials } from "../credentials";
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";
import { StorageModule } from "./storage";

export class VideosModule extends MessageModule {
    private channelIds: string[] = [
        "UC0jIctUPBK6lHw4AYnGHvCA", // Blimey Cow
        "UCUgSn3_q1PF6RcPHkuVHFHA", // Jordan Taylor
        "UCWKvCiwesNEBLNioZfrB5mQ", // Say Goodnight Kevin
        "UCu9cw1po780fcf0bgPbrqCg", // Adler Davidson
    ];

    private fileName: string = "videocheck-data.json";

    public getHelpLine(): string {
        return "/videocheck: Sends links for any recent Blimey Cow (and related) videos " +
            "(also runs automatically every 5 minutes)";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (StorageModule.storageInitialized && ctx.message.body === "/videocheck") {
            this.runCheck(ctx.api, ctx.message.threadID, false, ctx.message);
        }
    }

    public autoCheck(api: fbapi.Api): void {
        winston.debug("Auto-checking for new videos");
        this.runCheck(api, "890328284337788", true, undefined); // thread ID is tmbc
    }

    private runCheck(api: fbapi.Api, threadID: string, isAuto: boolean, message: fbapi.MessageEvent): void {
        const messageReason = isAuto ? "automatic timer" : message;
        const messages: string[] = [];
        let channelsDone = 0;
        this.channelIds.forEach((channelId) => {
            const path = "/youtube/v3/search?part=snippet&type=video&order=date&" +
            "fields=items(id%2FvideoId%2Csnippet(channelTitle%2CliveBroadcastContent%2CpublishedAt%2Ctitle))&" +
            `channelId=${channelId}&key=${credentials.youtubeApiKey}`;
            const req = https.get({
                host: "www.googleapis.com",
                path,
            }, (res) => {
                let body = "";
                res.on("data", (data: string) => {
                    body += data;
                });
                res.on("end", () => {
                    const data: IStoredData = storage.getItemSync(this.fileName) || {};
                    if (!data.hasOwnProperty(threadID)) {
                        data[threadID] = [];
                    }
                    let channelDataDirty = false;
                    const bodyJson = JSON.parse(body);
                    if (bodyJson && bodyJson.items) {
                        bodyJson.items.forEach((item: IYouTubeSearchItem) => {
                            if (item.id && item.id.videoId) {
                                if (data[threadID].indexOf(item.id.videoId) === -1) {
                                    if (this.ageInMillis(item.snippet.publishedAt) > 86400 * 1000) {
                                        winston.warn("Found old video in video check", item);
                                    } else {
                                        let introWord: string;
                                        if (item.snippet.liveBroadcastContent === "live") {
                                            introWord = "Live";
                                        } else if (item.snippet.liveBroadcastContent === "upcoming") {
                                            introWord = "Upcoming";
                                        } else {
                                            introWord = "New";
                                        }
                                        messages.push(`${introWord} ${item.snippet.channelTitle} video ` +
                                            `"${item.snippet.title}": https://youtu.be/${item.id.videoId}`);
                                    }
                                    data[threadID].push(item.id.videoId);
                                    channelDataDirty = true;
                                }
                            }
                        });
                    } else {
                        winston.warn("Didn't find items in video check", body, bodyJson);
                    }
                    if (channelDataDirty) {
                        storage.setItemSync(this.fileName, data);
                    }
                    channelsDone++;
                    if (channelsDone === this.channelIds.length) {
                        if (messages.length > 0) {
                            Utils.sendMessageDirect(api, messages.join("\n"), threadID, messageReason);
                        } else {
                            if (!isAuto) {
                                Utils.sendMessageDirect(api, "No new videos to report.", threadID, messageReason);
                            }
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

    private ageInMillis(publishedAt: string): number {
        const now = new Date();
        const diff = Math.abs(now.getTime() - new Date(publishedAt).getTime());
        return diff;
    }
}
interface IStoredData {
    [threadId: string]: string[];
}
interface IYouTubeSearchItem {
    id: { videoId: string };
    snippet: { title: string, channelTitle: string, liveBroadcastContent: string, publishedAt: string };
}
