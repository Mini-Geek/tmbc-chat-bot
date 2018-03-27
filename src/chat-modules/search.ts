import fbapi = require("facebook-chat-api");
import winston = require("winston");
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

export class SearchModule extends MessageModule {
    private pattern: RegExp = new RegExp("^/search (.*)$", "i");
    private lastState: {
        threadID: fbapi.InputID,
        searchOffset: number,
        contextMessageID: fbapi.InputID,
        upLimit: number,
        downLimit: number,
        messageIDs: { [messageIndex: number]: fbapi.InputID },
        query: string,
    } = undefined;
    public handleSelf(): boolean { return true; }
    public getHelpLine(): string {
        return `/search [any text] - Searches for that text in the current thread
/search more - Find more results from the last search
/search [number] - Go into the context of that index from your last search
/search up - When looking at context, see earlier messages
/search down - When looking at context, see later messages`;
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {

        if (ctx.message.body) {
            if (this.pattern.test(ctx.message.body)) {

                const handleMessages = (err: fbapi.ErrorObject, messages: fbapi.Message[], messageID: fbapi.InputID,
                                        limit: number, direction: string) => {
                    if (err) {
                        winston.error("Error searching msg context", err);
                    }
                    if (messages) {
                        winston.info("Search context", messages);
                        let response = "";
                        if (messages.length > 0) {
                            response += "'/search up' for more messages\n";
                            messages.forEach((message) => {
                                response += message.timestamp_datetime + ": ";
                                response += message.body + "\n";
                            });
                            response += "'/search down' for more messages\n";
                        } else {
                            response = "No messages found";
                        }
                        Utils.sendMessage(ctx, response);
                        // Utils.sendMessage(ctx, "Found " + obj.length + " things: " + obj);
                        if (direction === "up") {
                            this.lastState.upLimit = limit;
                        } else if (direction === "down") {
                            this.lastState.downLimit = limit;
                        } else {
                            this.lastState.upLimit = limit;
                            this.lastState.downLimit = limit;
                        }
                        this.lastState.contextMessageID = messageID;
                        // this.lastState = {
                        //     contextMessageID: messageID,
                        //     downLimit: undefined,
                        //     messageIDs: this.lastState.messageIDs,
                        //     searchOffset: this.lastState.searchOffset,
                        //     threadID: this.lastState.threadID,
                        //     upLimit: undefined,
                        // };
                    }
                };
                const handleSnippets =
                    (err: fbapi.ErrorObject, snippets: fbapi.Snippet[], offset: number, query: string) => {
                        if (err) {
                            winston.error("Error searching", err);
                        }
                        if (snippets) {
                            winston.info("Search results", snippets);
                            let response = "";
                            const messageIDs: { [messageIndex: number]: fbapi.InputID } =
                                this.lastState && this.lastState.messageIDs ? this.lastState.messageIDs : {};
                            if (snippets.length > 0) {
                                let index = 1;
                                let skipped = 0;
                                snippets.forEach((snippet) => {
                                    if (!snippet.body ||
                                        this.pattern.test(snippet.body) ||
                                        snippet.body.indexOf("'/search more' for more results") > -1) {
                                        skipped++;
                                    } else {
                                        messageIDs[index] = snippet.message_id;
                                        response += "#" + index + " at ";
                                        response += snippet.timestamp_datetime + ": ";
                                        response += snippet.body + "\n";
                                        index++;
                                    }
                                });
                                if (skipped > 0) {
                                    response += "[" + skipped + " result(s) skipped]\n";
                                }
                                if (index > 1) {
                                    response += "'/search 1' for context on the first result, and so on\n";
                                }
                                response += "'/search more' for more results\n";
                            } else {
                                response = "No results found";
                            }
                            Utils.sendMessage(ctx, response);
                            // Utils.sendMessage(ctx, "Found " + obj.length + " things: " + obj);
                            this.lastState = {
                                contextMessageID: undefined,
                                downLimit: undefined,
                                messageIDs,
                                query,
                                searchOffset: offset,
                                threadID: ctx.message.threadID,
                                upLimit: undefined,
                            };
                        }
                };

                const matches = this.pattern.exec(ctx.message.body);
                const msg = matches[1];

                let specialMessage = false;
                if (this.lastState && this.lastState.threadID === ctx.message.threadID) {
                    specialMessage = true;
                    if (msg === "more") {
                        // search more
                        const newOffset = this.lastState.searchOffset + 5;
                        ctx.api.searchForMessages(this.lastState.query, ctx.message.threadID, ctx.message.isGroup,
                            newOffset, (e, s) => handleSnippets(e, s, newOffset, this.lastState.query));
                    } else if (!isNaN(+msg)) {
                        // context
                        const messageID = this.lastState.messageIDs[+msg];
                        ctx.api.searchContext(messageID, ctx.message.threadID, ctx.message.isGroup, 6, undefined,
                            (e, m) => handleMessages(e, m, messageID, 6, undefined));
                    } else if (msg === "up" && this.lastState.contextMessageID) {
                        // up
                        const newLimit = this.lastState.upLimit + 10;
                        ctx.api.searchContext(this.lastState.contextMessageID,
                            ctx.message.threadID,
                            ctx.message.isGroup,
                            6, "up",
                            (e, m) => handleMessages(e, m, this.lastState.contextMessageID, newLimit, "up"));
                    } else if (msg === "down" && this.lastState.contextMessageID) {
                        // down
                        const newLimit = this.lastState.downLimit + 10;
                        ctx.api.searchContext(this.lastState.contextMessageID,
                            ctx.message.threadID,
                            ctx.message.isGroup,
                            newLimit, "down",
                            (e, m) => handleMessages(e, m, this.lastState.contextMessageID, newLimit, "down"));
                    } else {
                        specialMessage = false;
                    }
                }
                if (!specialMessage) {
                    // initial search
                    ctx.api.searchForMessages(msg, ctx.message.threadID, ctx.message.isGroup,
                        0, (e, s) => handleSnippets(e, s, 0, msg));
                }
            }
        }
    }
}
