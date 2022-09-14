export default class Video {
    constructor(videoData) {
        this.title = videoData.title;
        this.formats = videoData.formats;
        this.thumbnailUrl = videoData.thumbnail;
    }
}