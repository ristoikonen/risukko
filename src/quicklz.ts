/**
 * QuickLZ Compression Library - Ported to TypeScript for Bun
 * Implementation: Level 1 (Fastest Compression/Decompression)
 * import { QuickLZ } from "./quicklz";
 */

/**
 * QuickLZ Compression Library - Ported to TypeScript for Bun
 * Implementation: Level 1 (Fastest Compression/Decompression)
 */
/**
 * QuickLZ Compression Library - Ported to TypeScript for Bun
 * Implementation: Level 1 (Fastest Compression/Decompression)
 */
export default class QuickLZ {
  private static readonly DEFAULT_HEADER_LEN = 9;
  private static readonly HASH_VALUES = 4096;

  /**
   * Compresses a Uint8Array buffer using QuickLZ Level 1
   */
  public static compress(source: Uint8Array): Uint8Array {
    const srcLen = source.length;
    if (srcLen === 0) return new Uint8Array(0);

    const destination = new Uint8Array(srcLen + 400);
    const hash = new Int32Array(this.HASH_VALUES).fill(-1);

    // Header Setup
    destination[0] = 3; // Level 1 + Compressed flag indicators
    this.writeUInt32LE(destination, 1, srcLen); // Set uncompressed size block

    // Allocate the very first control word at the start of the payload bounds (index 9)
    let controlWordIdx = this.DEFAULT_HEADER_LEN;
    let dstIdx = controlWordIdx + 2; // Move data cursor past the control word marker
    
    let srcIdx = 0;
    let controlWord = 0;
    let controlBitsCount = 0;

    while (srcIdx < srcLen - 4) {
      if (controlBitsCount === 16) {
        this.writeUInt16LE(destination, controlWordIdx, controlWord);
        controlWordIdx = dstIdx;
        dstIdx += 2;
        controlWord = 0;
        controlBitsCount = 0;
      }

      const fetch = this.readUInt32LE(source, srcIdx) & 0xffffff;
      const hashVal = ((fetch >> 12) ^ fetch) & (this.HASH_VALUES - 1);
      const o = hash[hashVal];
      hash[hashVal] = srcIdx;

      if (o !== -1 && srcIdx - o! < 2048 && srcIdx - o! > 1 && source[o!] === source[srcIdx] && source[o! + 1] === source[srcIdx + 1] && source[o! + 2] === source[srcIdx + 2]) {
        let matchLen = 3;
        while (srcIdx + matchLen < srcLen && source[o! + matchLen] === source[srcIdx + matchLen] && matchLen < 63) {
          matchLen++;
        }

        const offset = srcIdx - o!;
        controlWord = (controlWord >> 1) | 0x8000;
        controlBitsCount++;

        if (matchLen < 7) {
          destination[dstIdx] = (matchLen << 2) | (offset >> 8) | 2;
          destination[dstIdx + 1] = offset & 0xff;
          dstIdx += 2;
        } else {
          destination[dstIdx] = ((offset >> 8) & 0x0f) | 0;
          destination[dstIdx + 1] = offset & 0xff;
          destination[dstIdx + 2] = matchLen;
          dstIdx += 3;
        }
        srcIdx += matchLen;
      } else {
        controlWord >>= 1;
        controlBitsCount++;
        destination[dstIdx++] = source[srcIdx++]!;
      }
    }

    // Process left-over bytes safely
    while (srcIdx < srcLen) {
      if (controlBitsCount === 16) {
        this.writeUInt16LE(destination, controlWordIdx, controlWord);
        controlWordIdx = dstIdx;
        dstIdx += 2;
        controlWord = 0;
        controlBitsCount = 0;
      }
      controlWord >>= 1;
      controlBitsCount++;
      destination[dstIdx++] = source[srcIdx++]!;
    }

    // Flush and backfill the final remaining active bit positions
    controlWord >>= (16 - controlBitsCount);
    this.writeUInt16LE(destination, controlWordIdx, controlWord);
    
    // Set the finalized total compressed file length cleanly into the header bounds
    this.writeUInt32LE(destination, 5, dstIdx);
    
    return destination.subarray(0, dstIdx);
  }

  /**
   * Decompresses a valid QuickLZ Level 1 block
   */
  public static decompress(source: Uint8Array): Uint8Array {
    if (source.length === 0) return new Uint8Array(0);

    const sizeDecompressed = this.readUInt32LE(source, 1);
    const destination = new Uint8Array(sizeDecompressed);

    let srcIdx = this.DEFAULT_HEADER_LEN;
    let dstIdx = 0;
    let controlWord = 0;
    let controlBitsCount = 0;

    while (dstIdx < sizeDecompressed) {
      if (controlBitsCount === 0) {
        controlWord = this.readUInt16LE(source, srcIdx);
        srcIdx += 2;
        controlBitsCount = 16;
      }

      if ((controlWord & 1) === 1) {
        let matchLen = 0;
        let offset = 0;

        if ((source[srcIdx]! & 3) === 2 || (source[srcIdx]! & 3) === 3) {
          matchLen = source[srcIdx]! >> 2;
          offset = ((source[srcIdx]! & 3) << 8) | source[srcIdx + 1]!;
          srcIdx += 2;
        } else {
          offset = (source[srcIdx]! << 8) | source[srcIdx + 1]!;
          matchLen = source[srcIdx + 2]!;
          srcIdx += 3;
        }

        let matchIdx = dstIdx - offset;
        for (let i = 0; i < matchLen; i++) {
          destination[dstIdx++] = destination[matchIdx++]!;
        }
      } else {
        destination[dstIdx++] = source[srcIdx++]!;
      }

      controlWord >>= 1;
      controlBitsCount--;
    }

    return destination;
  }

  private static readUInt16LE(buf: Uint8Array, offset: number): number {
    return buf[offset]! | (buf[offset + 1]! << 8);
  }

  private static readUInt32LE(buf: Uint8Array, offset: number): number {
    return (buf[offset]! | (buf[offset + 1]! << 8) | (buf[offset + 2]! << 16) | (buf[offset + 3]! << 24)) >>> 0;
  }

  private static writeUInt16LE(buf: Uint8Array, offset: number, val: number): void {
    buf[offset] = val & 0xff;
    buf[offset + 1] = (val >> 8) & 0xff;
  }

  private static writeUInt32LE(buf: Uint8Array, offset: number, val: number): void {
    buf[offset] = val & 0xff;
    buf[offset + 1] = (val >> 8) & 0xff;
    buf[offset + 2] = (val >> 16) & 0xff;
    buf[offset + 3] = (val >> 24) & 0xff;
  }
}


// Bun run .\src\quicklz.ts
// Compress and Compare
const originalText = "test".repeat(2);
const rawData = new TextEncoder().encode(originalText);
const compressedData = QuickLZ.compress(rawData);
console.log(`Original size: ${rawData.length} bytes`);
console.log(`Compressed size: ${compressedData.length} bytes`);

// Decompress and Compare
const decompressedText = new TextDecoder().decode(QuickLZ.decompress(compressedData));
console.log('originalText');
console.log(originalText);
console.log('decompressedText');
console.log(decompressedText);
console.log("Match?:", originalText === decompressedText);