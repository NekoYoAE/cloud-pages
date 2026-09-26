interface RingConfig {
  words: string[];
  name: string;
  radius: number;
  wordSize: number;
  wordSpacing: number;
  wordWeight: number;
  nameSize: number;
  nameSpacing: number;
  nameWeight: number;
  color: string;
  opacity: number;
}

export const ringConfig: RingConfig = {
  words: ['DESIGNER', 'DEVELOPER', 'FULLSTACK'],
  name: 'NEKOYO.CLOUD',
  radius: 71.5,
  wordSize: 9,
  wordSpacing: 1.6,
  wordWeight: 400,
  nameSize: 8,
  nameSpacing: 0,
  nameWeight: 700,
  color: '#1C1C1C',
  opacity: 0.4,
};
