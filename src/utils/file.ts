export interface UploadedFile {
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: Date;
}

export type PartialUploadedFile = Partial<UploadedFile>;

export const ImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif"
];
export const AudioTypes = ["audio/mpeg", "audio/wav", "audio/ogg"];
export const VideoTypes = ["video/mp4", "video/webm", "video/ogg"];
export const DocumentTypes = ["application/pdf", "text/plain"];
export const ExtensionTypes: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/avif": "avif",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/ogg": "ogv",
    "application/pdf": "pdf",
    "text/plain": "txt"
};

export const streamToArrayBuffer = async (
    stream: ReadableStream<Uint8Array>
): Promise<ArrayBuffer> => {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let totalLength = 0;

    while (true) {
        const { done, value } = await reader.read();

        if (done) break;
        if (value) {
            chunks.push(value);
            totalLength += value.length;
        }
    }

    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    return result.buffer;
};

export const arrayBufferToStream = (
    buffer: ArrayBuffer
): ReadableStream<Uint8Array> => {
    const uint8 = new Uint8Array(buffer);

    return new ReadableStream({
        start(controller) {
            controller.enqueue(uint8);
            controller.close();
        }
    });
};
