import { videoInfo, MoreVideoDetails, videoFormat, thumbnail } from "ytdl-core";

class VideoInfo {

    details: MoreVideoDetails;
    formats: videoFormat[];
    thumbs: thumbnail[];
    videoId: string;

    constructor(info: videoInfo) {
        this.details = info.videoDetails;
        this.formats = info.formats;
        this.thumbs = this.details.thumbnails;
        this.videoId = this.details.videoId;
    }

    getDescription():string|null {
        return this.details.description;
    }

    getTitle():string {
        return this.details.title;
    }
}

export default VideoInfo