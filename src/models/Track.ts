import { SampleGroup } from './Liveset';

export default class Track {
  isEnabled = true; // boolean, is the track enabled
  isPlaying = true; // boolean, is the track currently playing
  volume = 0.99; // number, between 0 and 1
  phaser: number; // number, between 0 and 1
  sampleGroup: SampleGroup; // SampleGroup, sample set it's attached to
  layers: number; // number, layer length [1~4]
  samples: AudioBufferSourceNode[] = []; // number[],
  partitions: boolean[][]; // boolean[16][], grid data
  labels: string[]; // List of labels
  name: string;
  _ = 1;

  audioCtx = new AudioContext();

  constructor(set: SampleGroup) {
    this.sampleGroup = set;
    this.layers = set.samples.length;
    this.name = set.name;
    this.labels = set.samples.map(e => e.name);
    this.partitions = set.samples.map(() => [
      !1,
      !1,
      !1,
      !1,
      !1,
      !1,
      !1,
      !1,
      !1,
      !1,
      !1,
      !1,
      !1,
      !1,
      !1,
      !1
    ]);
  }

  /**
   * Set track volume
   * @param volume Volume to set (between 0 and 1)
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  playAt(index: number) {
    this.partitions.forEach((partition, pIndex) => {
      if (partition[index]) {
        let old = this.samples[pIndex];
        old.disconnect();
        let n = this.audioCtx.createBufferSource();
        n.buffer = old.buffer;
        n.connect(this.audioCtx.destination);
        this.samples[pIndex] = n;
        this.samples[pIndex].start(0);
      }
    });
  }

  async addSample(audioFile: ArrayBuffer): Promise<any> {
    var source = this.audioCtx.createBufferSource();
    this.samples.push(source);
    this.layers = this.samples.length;

    return new Promise(resolve => {
      this.audioCtx.decodeAudioData(audioFile, buffer => {
        source.buffer = buffer;
        source.connect(this.audioCtx.destination);
        resolve();
      });
    });
  }
}
