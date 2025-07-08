export function parseTranscription(transcriptions: string) {
    transcriptions = transcriptions.slice(1, -1);

    const parts = transcriptions.split("$");

    const cleanedArr = parts
        .map(str =>
            str
                .replace(/\\n/g, '')
                .replace(/\\"/g, '"')
                .replace(/^\s+|\s+$/g, '')
                .replace(/^"|"$/g, '')
        )
        .filter(str => str.length > 0);

    return cleanedArr;
}
