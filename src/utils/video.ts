export const getVideosFromPlaylist = async (id: string) => {
    const url: string = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${id}&key=${
        import.meta.env.PUBLIC_GOOGLE_KEY
    }`;
    const videoId: string[] = [];

    const response: Response = await fetch(url);
    const json: any = await response.json();

    json.items.forEach((e: any) => videoId.push(e.snippet.resourceId.videoId));
    return videoId;
};
