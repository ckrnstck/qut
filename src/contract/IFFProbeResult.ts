import { IVideoStream } from '@ckrnstck/timecode-lib';

export interface IFFProbeResult
{
  width: number;
  height: number;
  videoStream: IVideoStream;
  bitrate: number;
}