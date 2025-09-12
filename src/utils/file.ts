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
