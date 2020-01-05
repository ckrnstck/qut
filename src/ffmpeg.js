// 1st party packages
const path = require('path');

// 2nd party packages
const core = require('./core');

const ffmpegApi = {
  async ffprobe(filepath)
  {
    const fullPath = path.resolve(filepath);
    const ffprobeArgs = ['ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream', fullPath]];

    const result = await core.spawnAndReadToEnd(ffprobeArgs);
    const lines = result.stdout.split('\n').filter(line => line.trim().length > 0);

    const output = {
      fullPath,
      pathParsed: path.parse(fullPath),
      width: -1,
      height: -1,
      fps: 0,
      duration: 0,
      frames: 0
    };

    for (const line of lines)
    {
      const lineParts = line.trim().split('=');

      switch (lineParts[0])
      {
        case 'width':
          output.width = parseInt(lineParts[1]);
          break;

        case 'height':
          output.height = parseInt(lineParts[1]);
          break;

        case 'r_frame_rate':
          output.fps = parseInt(eval([lineParts[1]]));
          break;

        case 'duration':
          const durationParts = lineParts[1].split('.');
          output.duration = parseInt(durationParts[0]);
          break;
      }
    }

    output.frames = output.fps * output.duration;

    return output;
  },

  thumbnailAtTimecode(filepath, timecode, outputFilepath)
  {
    return core.spawnAndReadToEnd(['ffmpeg', ['-y', '-ss', timecode, '-i', filepath, '-filter:v', 'scale=-1:-1', outputFilepath]]);
  },
  clipAtTimecode(filepath, timecode, length, outputFilepath)
  {
    return core.spawnAndReadToEnd(['ffmpeg', ['-i', filepath, '-ss', timecode, '-t', length, '-y', '-an', '-filter:v', 'scale=480:-1', outputFilepath]]);
  },
  async concatVideoFiles(files, outputFilepath)
  {
    const tempFiles = [];

    for (let file of files)
    {
      const filePathParsed = path.parse(path.resolve(file));
      const tempFilePath = path.join(filePathParsed.dir, filePathParsed.name + '.ts');

      await core.spawnAndReadToEnd(['ffmpeg', ['-i', file, '-codec', 'copy', '-y', '-f', 'mpegts', tempFilePath]]);

      tempFiles.push(tempFilePath);
    }

    await core.spawnAndReadToEnd(['ffmpeg', ['-i', `concat:${tempFiles.join('|')}`, '-codec', 'copy', '-y', outputFilepath]]);

    await core.spawnAndReadToEnd(['rm', ['-rf', ...tempFiles]]);
  }
};

module.exports = ffmpegApi;