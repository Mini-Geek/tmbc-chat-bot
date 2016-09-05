/**
 * Settings for message counts, emojis, and titles for different conversations.
 */
export const groups: {
    [key: string]: { preferredEmoji: string, preferredTitle: string, countBeforeMe: number }
} = {
    "890328284337788": {
        countBeforeMe: 169700,
        preferredEmoji: "🍻",
        preferredTitle: "They Might Be Christians",
    },
    "1170697212952081": {
        countBeforeMe: 0,
        preferredEmoji: "🍻",
        preferredTitle: "They Might Be Coders",
    },
};
/**
 * The name of this bot that it will use to identify itself.
 */
export const userFriendlyName = "The NSA";
/**
 * Pattern for listening for people talking to this bot.
 */
export const regexNamePattern = "((The )?NSA|Robby( A[sz]imov)?)";
