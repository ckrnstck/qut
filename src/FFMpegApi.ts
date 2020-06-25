import * as path from 'path';

import { IFFProbeResult, IChildProcessResult } from './contract';
import { Helpers } from './';

import { VideoStreamUtility, ITimecode } from '@ckrnstck/timecode-lib';

export class FFMpegApi
{
  public static async ffprobe(filepath: string): Promise<IFFProbeResult>
  {
    const fullPath = path.resolve(filepath);
    const args = ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream', fullPath];

    const result = await Helpers.spawnAndReadToEnd('ffprobe', args);
    const lines = result.stdout.split('\n').filter(line => line.trim().length > 0);

    let width = 0;
    let height = 0;
    let duration = 0;
    let framerate = 0;
    let bitrate = 0;

    for (const line of lines)
    {
      const lineParts = line.trim().split('=');

      switch (lineParts[0])
      {
        case 'width':
          width = parseInt(lineParts[1]);
          break;

        case 'height':
          height = parseInt(lineParts[1]);
          break;

        case 'r_frame_rate':
          framerate = parseFloat(parseFloat(eval(lineParts[1])).toFixed(2));
          break;

        case 'duration':
          const durationParts = lineParts[1].split('.');

          duration = parseInt(durationParts[0]);
          break;

        case 'bit_rate':
          bitrate = parseInt(lineParts[1]);
          break;
      }
    }

    const output: IFFProbeResult = {
      videoStream: VideoStreamUtility.fromSeconds(duration, framerate),
      width,
      height,
      bitrate
    };

    return output;
  }

  public static thumbnailAtTimecode(filepath: string, timecode: ITimecode, outputFilepath: string): Promise<IChildProcessResult>
  {
    const timecodeStr = timecode.toTimecodeString('.', ':');

    return Helpers.spawnAndReadToEnd('ffmpeg', ['-y', '-ss', timecodeStr, '-i', filepath, '-filter:v', 'scale=-1:-1', outputFilepath]);
  }

  public static clipAtTimecode(filepath: string, timecode: ITimecode, length: ITimecode, outputFilepath: string)
  {
    const timecodeStr = timecode.toTimecodeString('.', ':');
    const lengthStr = length.toTimecodeString('.', ':');

    return Helpers.spawnAndReadToEnd('ffmpeg', ['-i', filepath, '-ss', timecodeStr, '-t', lengthStr, '-y', '-an', '-filter:v', 'scale=480:-1', outputFilepath]);
  }

  public static async concatVideoFiles(files: string[], outputFilepath: string)
  {
    const tempFiles = [];

    for (let file of files)
    {
      const filePathParsed = path.parse(path.resolve(file));
      const tempFilePath = path.join(filePathParsed.dir, filePathParsed.name + '.ts');

      await Helpers.spawnAndReadToEnd('ffmpeg', ['-i', file, '-codec', 'copy', '-y', '-f', 'mpegts', tempFilePath]);

      tempFiles.push(tempFilePath);
    }

    await Helpers.spawnAndReadToEnd('ffmpeg', ['-i', `concat:${tempFiles.join('|')}`, '-codec', 'copy', '-y', outputFilepath]);

    await Helpers.spawnAndReadToEnd('rm', ['-rf', ...tempFiles]);
  }
}