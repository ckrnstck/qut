// 2nd party packages
const ffmpeg = require('./ffmpeg');

const convert = {
  secondsToTimecode(seconds, fps)
  {
    const hours = Math.floor(seconds / 3600);
    const hoursStr = (hours + '').padStart(2, '0');

    seconds -= hours * 3600;

    const minutes = Math.floor(seconds / 60);
    const minutesStr = (minutes + '').padStart(2, '0');

    seconds -= minutes * 60;
    const secondsStr = (seconds + '').padStart(2, '0');

    let result = `${hoursStr}:${minutesStr}:${secondsStr}`;

    if (fps == null)
    {
      result += '.00';
    }
    else
    {
      const frames = seconds * fps;
      const framesStr = (Math.floor(frames % fps) + '').padStart(2, '0');

      result += '.' + framesStr;
    }

    return result;
  },
  framesToTimecode(frames, fps)
  {
    const seconds = frames / fps;

    return convert.secondsToTimecode(seconds, fps);
  },
  timecodeToSeconds(timecode)
  {
    const parts = timecode.split(':');

    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  },
  async percentToTimecode(filepath, percent, field = 'duration')
  {
    const ffprobeResult = await ffmpeg.ffprobe(filepath);
    const seconds = parseInt((ffprobeResult[field] / 100) * percent);

    const percentTimecode = convert.secondsToTimecode(seconds);

    return percentTimecode;
  }
};

module.exports = convert;