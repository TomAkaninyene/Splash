import {Audio, getStaticFiles, Sequence, staticFile} from 'remotion';

const available = new Set(getStaticFiles().map((f) => f.name));
export const hasFile = (name: string) => available.has(name);

/** One-shot sound effect from public/sfx, starting at `at` (frames, relative to parent). */
export const Sfx: React.FC<{name: string; at: number; volume?: number; duration?: number}> = ({
  name,
  at,
  volume = 1,
  duration,
}) => (
  <Sequence from={at} durationInFrames={duration} layout="none" name={`sfx:${name}`}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

/**
 * Voice line(s) from public/vo. Only files that exist are played, so the video renders
 * fine before recordings arrive. Several files are layered, each offset by `stagger` frames.
 */
export const Vo: React.FC<{
  files: string[];
  at: number;
  stagger?: number;
  volume?: number;
  toneFrequency?: number;
}> = ({files, at, stagger = 0, volume = 1, toneFrequency}) => (
  <>
    {files
      .map((f) => `vo/${f}`)
      .filter(hasFile)
      .map((f, i) => (
        <Sequence key={f} from={at + i * stagger} layout="none" name={f}>
          <Audio src={staticFile(f)} volume={volume} toneFrequency={toneFrequency} />
        </Sequence>
      ))}
  </>
);

/** First existing file among candidates (e.g. music bed in either mp3 or wav). */
export const firstExisting = (candidates: string[]) => candidates.find(hasFile);
