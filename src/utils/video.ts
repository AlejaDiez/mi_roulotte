export namespace YouTube {
    export const loadYoutubeIframeAPI = () => {
        const iframeAPI: string = "https://www.youtube.com/iframe_api";

        if (document.head.querySelector(`script[src="${iframeAPI}"]`)) return;

        const script: HTMLScriptElement = document.createElement("script");

        script.setAttribute("src", iframeAPI);
        document.head.appendChild(script);
    };

    export const getId = (url: string) => {
        if (!URL.canParse(url)) return null;

        const urlObject = new URL(url);

        if (urlObject.hostname.includes("youtube.com")) {
            const params = urlObject.pathname.slice(1).split("/");

            if (params.includes("watch")) {
                return urlObject.searchParams.get("v");
            } else if (params.includes("shorts")) {
                return params.at(-1) ?? null;
            } else if (params.includes("playlist")) {
                return urlObject.searchParams.get("list");
            }
        } else if (urlObject.hostname.includes("youtu.be")) {
            return urlObject.pathname.slice(1);
        }
        return null;
    };

    export const getData = async (id: string) =>
        await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
        ).then<any>((res) => res.json());

    export const getPlaylistVideos = async (id: string) => {
        const response: any = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${id}&part=snippet&maxResults=50&key=${import.meta.env.YOUTUBE_TOKEN}`
        ).then(async (res) => await res.json());

        return (response.items as any[]).map<string>(
            ({ snippet }: any) =>
                `https://www.youtube.com/watch?v=${snippet.resourceId.videoId}`
        );
    };

    export const buildYoutubeIframe = (
        source: HTMLSourceElement,
        events?: {
            onReady?: () => void;
            onUnstarted?: () => void;
            onEnded?: () => void;
            onPlaying?: () => void;
            onPaused?: () => void;
            onBuffering?: () => void;
            onCued?: () => void;
            onSeek?: (currentTime: number, duration: number) => void;
        }
    ): YT.Player => {
        let interval: number | null = null;
        const handleStateChange = (state: YT.PlayerState) => {
            const clrInterval = () => {
                if (interval !== null) {
                    clearInterval(interval);
                    interval = null;
                }
                events?.onSeek?.(player.getCurrentTime(), player.getDuration());
            };

            const startInterval = () => {
                clrInterval();
                interval = window.setInterval(() => {
                    events?.onSeek?.(
                        player.getCurrentTime(),
                        player.getDuration()
                    );
                }, 100);
            };

            switch (state) {
                case YT.PlayerState.UNSTARTED:
                    events?.onUnstarted?.();
                    break;
                case YT.PlayerState.ENDED:
                    clrInterval();
                    events?.onEnded?.();
                    break;
                case YT.PlayerState.PLAYING:
                    startInterval();
                    events?.onPlaying?.();
                    break;
                case YT.PlayerState.PAUSED:
                    clrInterval();
                    events?.onPaused?.();
                    break;
                case YT.PlayerState.BUFFERING:
                    clrInterval();
                    events?.onBuffering?.();
                    break;
                case YT.PlayerState.CUED:
                    events?.onCued?.();
                    break;
            }
        };
        const player = new YT.Player(source, {
            videoId: getId(source.src)!,
            playerVars: {
                autohide: 1, // YT.AutoHide.HideAllControls
                autoplay: 0, // YT.AutoPlay.NoAutoPlay
                cc_load_policy: 0, // YT.ClosedCaptionsLoadPolicy.UserDefault
                cc_lang_pref: "es",
                controls: 0, // YT.Controls.Hide
                disablekb: 1, // YT.KeyboardControls.Disable
                enablejsapi: 1, // YT.JsApi.Enable
                fs: 0, // YT.FullscreenButton.Hide
                hl: "es",
                iv_load_policy: 3, // YT.IvLoadPolicy.Hide
                loop: 0, // YT.Loop.SinglePlay
                modestbranding: 1, // YT.ModestBranding.Modest
                mute: 0, // YT.Mute.NotMuted
                origin: import.meta.env.SITE,
                playsinline: 1, // YT.PlaysInline.Inline,
                rel: 0, // YT.RelatedVideos.Hide
                showinfo: 0 // YT.ShowInfo.Hide
            },
            events: {
                onReady: () => events?.onReady?.(),
                onStateChange: ({ data }) => handleStateChange(data)
            }
        });

        return player;
    };
}

export class VideoController {
    private nativePlayer: HTMLVideoElement | null;
    private youtubePlayer: YT.Player | HTMLSourceElement | null;
    readonly type: string;
    readonly container: HTMLDivElement;
    onReady?: () => void;
    onUnstarted?: () => void;
    onEnded?: () => void;
    onPlaying?: () => void;
    onPaused?: () => void;
    onBuffering?: () => void;
    onCued?: () => void;
    onSeek?: (currentTime: number, duration: number) => void;

    constructor(video: HTMLDivElement) {
        this.container = video.querySelector<HTMLDivElement>(".player")!;
        this.nativePlayer =
            this.container.querySelector<HTMLVideoElement>("video");
        this.youtubePlayer =
            this.container.querySelector<HTMLSourceElement>("source");

        // Get player type
        if (this.nativePlayer) {
            this.type = "native";
            // Add listeners
            this.nativePlayer!.addEventListener("canplay", () => {
                this.onReady?.();
            });
            this.nativePlayer!.addEventListener("playing", () => {
                this.onPlaying?.();
            });
            this.nativePlayer!.addEventListener("pause", () => {
                if (!this.nativePlayer!.ended) {
                    this.onPaused?.();
                }
            });
            this.nativePlayer!.addEventListener("waiting", () => {
                this.onBuffering?.();
            });
            this.nativePlayer!.addEventListener("ended", () => {
                this.onEnded?.();
            });
            this.nativePlayer!.addEventListener("timeupdate", () => {
                this.onSeek?.(this.getCurrentTime(), this.getDuration());
            });
        } else if (YouTube.getId(this.youtubePlayer?.src ?? "")) {
            this.type = "youtube";
            // Load youtube iframe api
            YouTube.loadYoutubeIframeAPI();
        } else {
            throw new Error("No video player found");
        }
    }

    private initIframe(onReady?: (player: YT.Player) => void) {
        if (this.youtubePlayer instanceof HTMLSourceElement) {
            this.youtubePlayer = YouTube.buildYoutubeIframe(
                this.youtubePlayer!,
                {
                    onReady: () => {
                        this.onReady?.();
                        onReady?.(this.youtubePlayer as YT.Player);
                    },
                    onUnstarted: this.onUnstarted,
                    onEnded: this.onEnded,
                    onPlaying: this.onPlaying,
                    onPaused: this.onPaused,
                    onBuffering: this.onBuffering,
                    onCued: this.onCued,
                    onSeek: this.onSeek
                }
            );
        }
    }

    play() {
        if (this.type === "native") {
            this.nativePlayer!.play();
        } else if (this.type === "youtube") {
            if (this.youtubePlayer instanceof HTMLSourceElement) {
                this.initIframe((e) => e.playVideo());
            } else {
                this.youtubePlayer!.playVideo();
            }
        }
    }

    pause() {
        if (this.type === "native") {
            this.nativePlayer!.pause();
        } else if (this.type === "youtube") {
            if (this.youtubePlayer instanceof HTMLSourceElement) {
                this.initIframe((e) => e.pauseVideo());
            } else {
                this.youtubePlayer!.pauseVideo();
            }
        }
    }

    getState(): string {
        if (this.type === "native") {
            if (this.nativePlayer!.ended) return "ended";
            if (this.nativePlayer!.paused && this.getCurrentTime() === 0)
                return "unstarted";
            if (this.nativePlayer!.paused) return "paused";
            if (this.nativePlayer!.readyState < 3) return "buffering";
            return "playing";
        } else if (
            this.type === "youtube" &&
            this.youtubePlayer instanceof YT.Player
        ) {
            switch ((this.youtubePlayer as YT.Player).getPlayerState()) {
                case YT.PlayerState.ENDED:
                    return "ended";
                case YT.PlayerState.UNSTARTED:
                case YT.PlayerState.CUED:
                    return "unstarted";
                case YT.PlayerState.PAUSED:
                    return "paused";
                case YT.PlayerState.BUFFERING:
                    return "buffering";
                case YT.PlayerState.PLAYING:
                    return "playing";
            }
        }
        return "";
    }

    toggleState() {
        if (
            this.type === "youtube" &&
            this.youtubePlayer instanceof HTMLSourceElement
        ) {
            this.initIframe((e) => e.playVideo());
        } else {
            switch (this.getState()) {
                case "ended":
                    this.seek(0);
                case "unstarted":
                case "paused":
                    this.play();
                    break;
                case "buffering":
                case "playing":
                    this.pause();
                    break;
            }
        }
    }

    getDuration(): number {
        if (this.type === "native") {
            return this.nativePlayer!.duration;
        } else if (
            this.type === "youtube" &&
            this.youtubePlayer instanceof YT.Player
        ) {
            return this.youtubePlayer!.getDuration();
        }
        return -1;
    }

    getCurrentTime(): number {
        if (this.type === "native") {
            return this.nativePlayer!.currentTime;
        } else if (
            this.type === "youtube" &&
            this.youtubePlayer instanceof YT.Player
        ) {
            return this.youtubePlayer!.getCurrentTime();
        }
        return -1;
    }

    private getFormatedDuration(duration: number): string {
        const hours = Math.floor(Math.max(duration, 0) / 3600);
        const minutes = Math.floor((Math.max(duration, 0) % 3600) / 60);
        const seconds = Math.floor(Math.max(duration, 0) % 60);

        const pad = (n: number) => n.toString().padStart(2, "0");

        return hours > 0
            ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
            : `${pad(minutes)}:${pad(seconds)}`;
    }

    getElapsedTime(): string {
        return this.getFormatedDuration(this.getCurrentTime());
    }

    getRemainingTime(): string {
        return `-${this.getFormatedDuration(this.getDuration() - this.getCurrentTime())}`;
    }

    seek(seconds: number) {
        if (seconds >= 0 && seconds <= this.getDuration()) {
            if (this.type === "native") {
                this.nativePlayer!.currentTime = seconds;
            } else if (
                this.type === "youtube" &&
                this.youtubePlayer instanceof YT.Player
            ) {
                this.youtubePlayer!.seekTo(seconds, true);
            }
        }
    }

    isMute(): boolean {
        if (this.type === "native") {
            return this.nativePlayer!.muted;
        } else if (
            this.type === "youtube" &&
            this.youtubePlayer instanceof YT.Player
        ) {
            return this.youtubePlayer!.isMuted();
        }
        return true;
    }

    mute() {
        if (this.type === "native") {
            this.nativePlayer!.muted = true;
        } else if (
            this.type === "youtube" &&
            this.youtubePlayer instanceof YT.Player
        ) {
            this.youtubePlayer!.mute();
        }
    }

    unMute() {
        if (this.type === "native") {
            this.nativePlayer!.muted = false;
        } else if (
            this.type === "youtube" &&
            this.youtubePlayer instanceof YT.Player
        ) {
            this.youtubePlayer!.unMute();
        }
    }

    getVolume(): number {
        if (this.type === "native") {
            return this.nativePlayer!.volume;
        } else if (
            this.type === "youtube" &&
            this.youtubePlayer instanceof YT.Player
        ) {
            return this.youtubePlayer!.getVolume();
        }
        return -1;
    }

    volume(val: number) {
        if (this.type === "native") {
            this.nativePlayer!.volume = val;
        } else if (
            this.type === "youtube" &&
            this.youtubePlayer instanceof YT.Player
        ) {
            this.youtubePlayer!.setVolume(val);
        }
    }
}
