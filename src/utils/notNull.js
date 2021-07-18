export function notNull(value, replacer) {
    return value !== null && value !== void 0 ? value : replacer;
}
