const { spawn } = require('child_process');

const core = {
  spawnAndReadToEnd(spawnArgs)
  {
    const proc = spawn(...spawnArgs);

    return new Promise(resolve =>
    {
      const result = {
        stdout: '',
        stderr: ''
      };

      proc.stdout.on('data', data =>
      {
        result.stdout += data.toString();
      });

      proc.stderr.on('data', data =>
      {
        result.stderr += data.toString();
      });

      proc.on('close', exitCode =>
      {
        resolve(result);
      });
    });
  }
};

module.exports = core;