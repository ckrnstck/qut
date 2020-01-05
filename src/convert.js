// 2nd party packages
const ffmpeg = require('./ffmpeg');

const convert = {
  secondsToTimecode(seconds)
  {
    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;

    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    return `${(hours + '').padStart(2, '0')}:${(minutes + '').padStart(2, '0')}:${(Math.floor(seconds) + '').padStart(2, '0')}`;
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