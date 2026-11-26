import { createHash } from 'node:crypto';
// Node-only digest; no browser bundle or extra runtime dependency.
/** @param {string} text @returns {string} */
export function sha256(text) { return createHash('sha256').update(text,'utf8').digest('hex'); }
