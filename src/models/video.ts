export abstract class Video {
    readonly src: string;

    constructor(src: string) {
        this.src = src;
    }
}

export class YoutubeVideo extends Video {
    readonly id: string;

    constructor(src: string) {
        const youtubeRegEx: RegExp =
            /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

        super(src);
        this.id = src.match(youtubeRegEx)?.at(1) ?? "";
    }
}

export class LazyVideo extends Video {
    constructor() {
        super("");
    }
}
