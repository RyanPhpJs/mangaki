import short from "short-uuid";

const BASE = "iQCbdFKeqH2x0wWr63vVgf7UcSBDXNZj9s4tpEoRlayuJGILnYAPMzO8T15hkm";

// By default shortened values are now padded for consistent length.
// If you want to produce variable lengths, like in 3.1.1
const translator = short(BASE, {
    consistentLength: false,
});

export function encode(id) {
    return translator.fromUUID(id);
}

export function decode(id) {
    return translator.toUUID(id);
}

export function isValidUUID(uuid) {
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

export function generate() {
    return translator.generate() + translator.generate();
}
