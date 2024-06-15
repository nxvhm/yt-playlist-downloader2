import ytdl from "@distube/ytdl-core";
import { readFileSync } from "fs";

let cookies = [];
try {
    let jsonCookies = readFileSync(__dirname+'/../cookies.json');
    cookies = JSON.parse(jsonCookies.toString());
} catch (error) {
    console.error("Error during cookies fetch: ", error);
}

const agent = ytdl.createAgent(cookies);
export default agent;
