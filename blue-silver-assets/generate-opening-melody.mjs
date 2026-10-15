import { writeFile } from 'node:fs/promises';

// Original, quiet music-box theme. No samples or third-party recordings are used.
const sampleRate = 22050;
const duration = 24;
const samples = new Float64Array(sampleRate * duration);
const beat = 0.75;
const frequency = note => 440 * 2 ** ((note - 69) / 12);

function bell(note, start, gain, decay = 1.4) {
  const hz = frequency(note);
  const length = Math.min(decay * 4, duration - start);
  for (let index = 0; index < length * sampleRate; index++) {
    const time = index / sampleRate;
    const attack = Math.min(1, time / 0.012);
    const fundamental = Math.sin(2 * Math.PI * hz * time) * Math.exp(-time / decay);
    const overtone = 0.22 * Math.sin(2 * Math.PI * hz * 2 * time) * Math.exp(-time / (decay * 0.45));
    const shimmer = 0.06 * Math.sin(2 * Math.PI * hz * 3 * time) * Math.exp(-time / (decay * 0.22));
    const offset = Math.floor(start * sampleRate) + index;
    if (offset < samples.length) samples[offset] += gain * attack * (fundamental + overtone + shimmer);
  }
}

const harmony = [[48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59]];
const melody = [
  [76, 79, 81, 79], [76, 72, 74, 76], [77, 81, 79, 77], [74, 71, 74, 79],
  [79, 83, 81, 76], [81, 79, 76, 72], [77, 76, 74, 69], [71, 74, 72]
];
for (let bar = 0; bar < 8; bar++) {
  const start = bar * beat * 4;
  harmony[bar % harmony.length].forEach((note, index) => bell(note, start + index * beat, 0.06, 1.8));
  melody[bar].forEach((note, index) => bell(note, start + index * beat, 0.12));
}

const wav = Buffer.alloc(44 + samples.length * 2);
wav.write('RIFF', 0);
wav.writeUInt32LE(wav.length - 8, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(samples.length * 2, 40);
for (let index = 0; index < samples.length; index++) {
  const seconds = index / sampleRate;
  const fade = Math.min(1, seconds / 0.1, (duration - seconds) / 1.5);
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[index] * fade)) * 32767), 44 + index * 2);
}
await writeFile(new URL('./opening-melody.wav', import.meta.url), wav);
console.log(`Created a ${duration}s original opening melody (${wav.length} bytes).`);
