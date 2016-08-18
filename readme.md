This is a chatbot based on the unofficial [facebook-chat-api](https://github.com/Schmavery/facebook-chat-api) library.

Settings included for using [Visual Studio Code](https://code.visualstudio.com/) as your editor.

Note that it should work in any group chat, though there are some behaviors specified for certain threads and users.

Setup:

- Run `npm install`, `npm install -g typescript typings`, and make sure your PATH variable is configured so that a TypeScript 1.8+ compiler (`tsc`) is in it.
- Copy `credentials.template.ts` to `credentials.ts` and fill in the email and password of the Facebook account you want your bot to use.
- Hit F5 in Visual Studio Code, or run `npm start`, and see if it runs.
