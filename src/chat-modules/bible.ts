import fbapi = require("facebook-chat-api");
import https = require("https");
import winston = require("winston");
import { credentials } from "../credentials";
import { Utils } from "../utils";
import { IContext, MessageModule } from "./chat-module";

export class BibleModule extends MessageModule {
    private defaultTranslationId = "06125adad2d5898a-01";
    private defaultTranslationName = "ASV";
    private bibleReferencePattern: RegExp = new RegExp("^([A-Z0-9\\ ]+)\\s*(\\d+)(:\\d+)?$", "i");
    private chapterVerseReferencePattern: RegExp = new RegExp("^(\\d+:)?(\\d+)$", "i");
    public getHelpLine(): string {
        return "/bible [verse reference, e.g. John 3:16] - print the verse(s)\n" +
               "/bible search [keywords] - search for the keywords, and print 5 most relevant verses";
    }

    public processMessage(ctx: IContext<fbapi.MessageEvent>): void {
        if (ctx.message.body && ctx.message.body.startsWith("/bible ")) {
            ctx.messageHandled = true;
            // if (ctx.message.body === "/bible versions") {
            //     this.listVersions(ctx);
            // } else if (ctx.message.body === "/bible books") {
            //     this.listBooks(ctx);
            if (ctx.message.body.startsWith("/bible search ")) {
                const searchTerms = ctx.message.body.substr("/bible search ".length);
                this.search(ctx, searchTerms);
            // } else if (ctx.message.body.startsWith("/bible parsetest ")) {
            //     const verseRef = this.parseVerses(ctx.message.body.substr("/bible parsetest ".length));
            //     if (verseRef instanceof Error) {
            //         winston.error("Error parsing verses", verseRef);
            //         Utils.sendMessage(ctx, "Err, " + verseRef.message);
            //     } else {
            //         Utils.sendMessage(ctx, verseRef);
            //     }
            } else {
                const verseRef = this.parseVerses(ctx.message.body.substr("/bible ".length));
                if (verseRef instanceof Error) {
                    winston.error("Error parsing verses", verseRef);
                    Utils.sendMessage(ctx, "Err, " + verseRef.message);
                } else {
                    this.getVerses(ctx, verseRef);
                }
            }
        }
    }

    // private listVersions(ctx: IContext<fbapi.MessageEvent>): void {
    //     const req = https.get({
    //         headers: { "api-key": credentials.bibleApiKey },
    //         host: "api.scripture.api.bible",
    //         path: "/v1/bibles",
    //     }, (res) => {
    //         let body = "";
    //         res.on("data", (data: string) => {
    //             body += data;
    //         });
    //         res.on("end", async () => {
    //             winston.debug("Response received from Bible API", body);
    //             const bodyJson: IVersionsResponse = JSON.parse(body);
    //             if (bodyJson && bodyJson.data) {
    //                 let msg = "";
    //                 bodyJson.data.forEach((translation) => {
    //                     if (translation.language.id === "eng") {
    //                         msg += `${translation.name} (${translation.abbreviation}, ${translation.description})\n`;
    //                     }
    //                 });
    //                 Utils.sendMessage(ctx,
    //                     `There are ${bodyJson.data.length} translations available, `
    //                     + "the English ones are:\n"
    //                     + msg);
    //             } else if (bodyJson && bodyJson.statusCode >= 400 && bodyJson.statusCode < 600) {
    //                 // error
    //                 winston.error("Error returned from Bible API request.", bodyJson);
    //                 Utils.sendMessage(ctx, "Sorry, bible API returned error");
    //             }
    //         });
    //     });
    //     req.on("error", (e: any) => {
    //         winston.error("Error making Bible API request.", e);
    //         Utils.sendMessage(ctx, "Sorry, I can't talk to the bible API");
    //     });
    //     req.end();
    // }

    // private listBooks(ctx: IContext<fbapi.MessageEvent>): void {
    //     const req = https.get({
    //         headers: { "api-key": credentials.bibleApiKey },
    //         host: "api.scripture.api.bible",
    //         path: `/v1/bibles/${this.defaultTranslationId}/books`,
    //     }, (res) => {
    //         let body = "";
    //         res.on("data", (data: string) => {
    //             body += data;
    //         });
    //         res.on("end", async () => {
    //             winston.debug("Response received from Bible API", body);
    //             const bodyJson: any = JSON.parse(body);
    //             if (bodyJson && bodyJson.data) {
    //                 let msg = "";
    //                 bodyJson.data.forEach((translation: IBibleVersion) => {
    //                     if (translation.language.id === "eng") {
    //                         msg += `${translation.name} (${translation.abbreviation}, ${translation.description})\n`;
    //                     }
    //                 });
    //                 Utils.sendMessage(ctx,
    //                     `There are ${bodyJson.data.length} translations available, `
    //                     + "the English ones are:\n"
    //                     + msg);
    //             } else if (bodyJson && bodyJson.statusCode >= 400 && bodyJson.statusCode < 600) {
    //                 // error
    //                 winston.error("Error returned from Bible API request.", bodyJson);
    //                 Utils.sendMessage(ctx, "Sorry, bible API returned error");
    //             }
    //         });
    //     });
    //     req.on("error", (e: any) => {
    //         winston.error("Error making Bible API request.", e);
    //         Utils.sendMessage(ctx, "Sorry, I can't talk to the bible API");
    //     });
    //     req.end();
    // }

    private getVerses(ctx: IContext<fbapi.MessageEvent>, verseRef: string): void {
        const req = https.get({
            headers: { "api-key": credentials.bibleApiKey },
            host: "api.scripture.api.bible",
            path: `/v1/bibles/${this.defaultTranslationId}/passages/${encodeURIComponent(verseRef)}` +
                    "?content-type=text&include-notes=true",
        }, (res) => {
            let body = "";
            res.on("data", (data: string) => {
                body += data;
            });
            res.on("end", async () => {
                winston.debug("Response received from Bible API", body);
                const bodyJson: IPassageResponse = JSON.parse(body);
                if (bodyJson && bodyJson.data) {
                    Utils.sendMessage(ctx, bodyJson.data.content +
                        bodyJson.data.reference +
                        ` (${this.defaultTranslationName})`);
                } else if (bodyJson && bodyJson.statusCode >= 400 && bodyJson.statusCode < 600) {
                    // error
                    winston.error("Error returned from Bible API request.", bodyJson);
                    Utils.sendMessage(ctx, "Sorry, bible API returned error");
                }
            });
        });
        req.on("error", (e: any) => {
            winston.error("Error making Bible API request.", e);
            Utils.sendMessage(ctx, "Sorry, I can't talk to the bible API");
        });
        req.end();
    }

    private parseVerses(rawVerseRef: string): string | Error {
        const sections = rawVerseRef.split("-");
        let pattern: string;
        let bookId: string = null;
        let chapter: string;
        if (sections.length > 2) {
            return new Error("I couldn't understand you: more than one dash");
        }
        if (this.bibleReferencePattern.test(sections[0])) {
            const matches = this.bibleReferencePattern.exec(sections[0]);
            const book = matches[1].trim();
            chapter = matches[2];
            let verse = matches[3];
            if (verse && verse.startsWith(":")) {
                verse = verse.substr(1);
            }

            this.cachedBookData.forEach((b) => {
                if (b.abbreviation.toLocaleUpperCase() === book.toLocaleUpperCase() ||
                    b.name.toLocaleUpperCase() === book.toLocaleUpperCase()) {
                    bookId = b.id;
                }
            });
            if (bookId === null) {
                return new Error('I couldn\'t understand you: "' + book +
                '" isn\'t recognized as a proper book name.');
            }

            pattern = bookId + (chapter ? "." + chapter + (verse ? "." + verse : "") : "");
        } else {
            return new Error('I couldn\'t understand you: "' + sections[0] +
            '" doesn\'t seem to match the required pattern of "Book 2:3"');
        }
        if (sections[1]) {
            if (this.chapterVerseReferencePattern.test(sections[1])) {
                const matches = this.chapterVerseReferencePattern.exec(sections[1]);
                let endChapter = matches[1];
                if (endChapter && endChapter.endsWith(":")) {
                    endChapter = endChapter.substr(0, endChapter.length - 1);
                }
                const verse = matches[2];

                if (!endChapter) {
                    endChapter = chapter;
                }
                const endPattern = bookId + (endChapter ? "." + endChapter + (verse ? "." + verse : "") : "");
                pattern += "-" + endPattern;
            } else {
                return new Error('I couldn\'t understand you: "' + sections[1] +
                '" doesn\'t seem to match the required pattern of "2:3"');
            }
        }
        return pattern;
    }

    private search(ctx: IContext<fbapi.MessageEvent>, searchTerms: string): void {
        const req = https.get({
            headers: { "api-key": credentials.bibleApiKey },
            host: "api.scripture.api.bible",
            path: `/v1/bibles/${this.defaultTranslationId}/search?query=${encodeURIComponent(searchTerms)}&limit=5`,
        }, (res) => {
            let body = "";
            res.on("data", (data: string) => {
                body += data;
            });
            res.on("end", async () => {
                winston.debug("Response received from Bible API", body);
                const bodyJson: ISearchResponse = JSON.parse(body);
                if (bodyJson && bodyJson.data) {
                    let msg = "\n";
                    if (bodyJson.data.total > 0 && bodyJson.data.verses) {
                        bodyJson.data.verses.forEach((verse) => {
                            msg += `${verse.text} (${verse.reference})\n`;
                        });
                    } else {
                        msg = "";
                    }
                    Utils.sendMessage(ctx,
                        `${bodyJson.data.total} search results (${this.defaultTranslationName})`
                        + msg);
                } else if (bodyJson && bodyJson.statusCode >= 400 && bodyJson.statusCode < 600) {
                    // error
                    winston.error("Error returned from Bible API request.", bodyJson);
                    Utils.sendMessage(ctx, "Sorry, bible API returned error");
                }
            });
        });
        req.on("error", (e: any) => {
            winston.error("Error making Bible API request.", e);
            Utils.sendMessage(ctx, "Sorry, I can't talk to the bible API");
        });
        req.end();
    }

    // tslint:disable-next-line:member-ordering
    private cachedBookData: IBookData[] = [
        {
            abbreviation: "Gen",
            id: "GEN",
            name: "Genesis",
          },
          {
            abbreviation: "Exo",
            id: "EXO",
            name: "Exodus",
          },
          {
            abbreviation: "Lev",
            id: "LEV",
            name: "Leviticus",
          },
          {
            abbreviation: "Num",
            id: "NUM",
            name: "Numbers",
          },
          {
            abbreviation: "Deu",
            id: "DEU",
            name: "Deuteronomy",
          },
          {
            abbreviation: "Jos",
            id: "JOS",
            name: "Joshua",
          },
          {
            abbreviation: "Jdg",
            id: "JDG",
            name: "Judges",
          },
          {
            abbreviation: "Rut",
            id: "RUT",
            name: "Ruth",
          },
          {
            abbreviation: "1Sa",
            id: "1SA",
            name: "1 Samuel",
          },
          {
            abbreviation: "2Sa",
            id: "2SA",
            name: "2 Samuel",
          },
          {
            abbreviation: "1Ki",
            id: "1KI",
            name: "1 Kings",
          },
          {
            abbreviation: "2Ki",
            id: "2KI",
            name: "2 Kings",
          },
          {
            abbreviation: "1Ch",
            id: "1CH",
            name: "1 Chronicles",
          },
          {
            abbreviation: "2Ch",
            id: "2CH",
            name: "2 Chronicles",
          },
          {
            abbreviation: "Ezr",
            id: "EZR",
            name: "Ezra",
          },
          {
            abbreviation: "Neh",
            id: "NEH",
            name: "Nehemiah",
          },
          {
            abbreviation: "Est",
            id: "EST",
            name: "Esther",
          },
          {
            abbreviation: "Job",
            id: "JOB",
            name: "Job",
          },
          {
            abbreviation: "Psa",
            id: "PSA",
            name: "Psalms",
          },
          {
            abbreviation: "Pro",
            id: "PRO",
            name: "Proverbs",
          },
          {
            abbreviation: "Ecc",
            id: "ECC",
            name: "Ecclesiastes",
          },
          {
            abbreviation: "Sng",
            id: "SNG",
            name: "Song of Solomon",
          },
          {
            abbreviation: "Isa",
            id: "ISA",
            name: "Isaiah",
          },
          {
            abbreviation: "Jer",
            id: "JER",
            name: "Jeremiah",
          },
          {
            abbreviation: "Lam",
            id: "LAM",
            name: "Lamentations",
          },
          {
            abbreviation: "Ezk",
            id: "EZK",
            name: "Ezekiel",
          },
          {
            abbreviation: "Dan",
            id: "DAN",
            name: "Daniel",
          },
          {
            abbreviation: "Hos",
            id: "HOS",
            name: "Hosea",
          },
          {
            abbreviation: "Jol",
            id: "JOL",
            name: "Joel",
          },
          {
            abbreviation: "Amo",
            id: "AMO",
            name: "Amos",
          },
          {
            abbreviation: "Oba",
            id: "OBA",
            name: "Obadiah",
          },
          {
            abbreviation: "Jon",
            id: "JON",
            name: "Jonah",
          },
          {
            abbreviation: "Mic",
            id: "MIC",
            name: "Micah",
          },
          {
            abbreviation: "Nam",
            id: "NAM",
            name: "Nahum",
          },
          {
            abbreviation: "Hab",
            id: "HAB",
            name: "Habakkuk",
          },
          {
            abbreviation: "Zep",
            id: "ZEP",
            name: "Zephaniah",
          },
          {
            abbreviation: "Hag",
            id: "HAG",
            name: "Haggai",
          },
          {
            abbreviation: "Zec",
            id: "ZEC",
            name: "Zechariah",
          },
          {
            abbreviation: "Mal",
            id: "MAL",
            name: "Malachi",
          },
          {
            abbreviation: "Mat",
            id: "MAT",
            name: "Matthew",
          },
          {
            abbreviation: "Mrk",
            id: "MRK",
            name: "Mark",
          },
          {
            abbreviation: "Luk",
            id: "LUK",
            name: "Luke",
          },
          {
            abbreviation: "Jhn",
            id: "JHN",
            name: "John",
          },
          {
            abbreviation: "Act",
            id: "ACT",
            name: "Acts",
          },
          {
            abbreviation: "Rom",
            id: "ROM",
            name: "Romans",
          },
          {
            abbreviation: "1Co",
            id: "1CO",
            name: "1 Corinthians",
          },
          {
            abbreviation: "2Co",
            id: "2CO",
            name: "2 Corinthians",
          },
          {
            abbreviation: "Gal",
            id: "GAL",
            name: "Galatians",
          },
          {
            abbreviation: "Eph",
            id: "EPH",
            name: "Ephesians",
          },
          {
            abbreviation: "Php",
            id: "PHP",
            name: "Philippians",
          },
          {
            abbreviation: "Col",
            id: "COL",
            name: "Colossians",
          },
          {
            abbreviation: "1Th",
            id: "1TH",
            name: "1 Thessalonians",
          },
          {
            abbreviation: "2Th",
            id: "2TH",
            name: "2 Thessalonians",
          },
          {
            abbreviation: "1Ti",
            id: "1TI",
            name: "1 Timothy",
          },
          {
            abbreviation: "2Ti",
            id: "2TI",
            name: "2 Timothy",
          },
          {
            abbreviation: "Tit",
            id: "TIT",
            name: "Titus",
          },
          {
            abbreviation: "Phm",
            id: "PHM",
            name: "Philemon",
          },
          {
            abbreviation: "Heb",
            id: "HEB",
            name: "Hebrews",
          },
          {
            abbreviation: "Jas",
            id: "JAS",
            name: "James",
          },
          {
            abbreviation: "1Pe",
            id: "1PE",
            name: "1 Peter",
          },
          {
            abbreviation: "2Pe",
            id: "2PE",
            name: "2 Peter",
          },
          {
            abbreviation: "1Jn",
            id: "1JN",
            name: "1 John",
          },
          {
            abbreviation: "2Jn",
            id: "2JN",
            name: "2 John",
          },
          {
            abbreviation: "3Jn",
            id: "3JN",
            name: "3 John",
          },
          {
            abbreviation: "Jud",
            id: "JUD",
            name: "Jude",
          },
          {
            abbreviation: "Rev",
            id: "REV",
            name: "Revelation",
          },
        ];
}

interface IPassageResponse {
    data: IPassageData;
    meta: any;
    statusCode: number;
}
interface IPassageData {
    id: string;
    orgId: string;
    bibleId: string;
    bookId: string;
    chapterIds: string[];
    reference: string;
    content: string;
    copyright: string;
}
interface ISearchResponse {
    data: { query: string, limit: number, offset: number, total: number, verses: IBibleVerse[] };
    meta: any;
    statusCode: number;
}
interface IBibleVerse {
    id: string;
    orgId: string;
    bookId: string;
    bibleId: string;
    chapterId: string;
    reference: string;
    text: string;
}
// interface IVersionsResponse {
//     data: IBibleVersion[];
//     statusCode: number;
// }
// interface IBibleVersion {
//     id: string;
//     dblId: string;
//     relatedDbl: string;
//     name: string;
//     nameLocal: string;
//     abbreviation: string;
//     abbreviationLocal: string;
//     description: string;
//     descriptionLocal: string;
//     language: ILanguage;
//     countries: ICountry[];
//     type: string;
//     audioBibles: any[];
// }
// interface ILanguage {
//     id: string;
//     name: string;
//     nameLocal: string;
//     script: string;
//     scriptDirection: "LTR" | "RTL";
// }
// interface ICountry {
//     id: string;
//     name: string;
//     nameLocal: string;
// }
interface IBookData {
    abbreviation: string;
    id: string;
    name: string;
}
