import { spawn } from 'child_process';

import { IChildProcessResult } from './contract';

export class Helpers
{
  public static spawnAndReadToEnd(command: string, args: string[] = []): Promise<IChildProcessResult>
  {
    return new Promise(resolve =>
    {
      const proc = spawn(command, args);

      const result: IChildProcessResult = {
        stdout: '',
        stderr: ''
      };

      proc.stdout.on('data', (data: any) => 
      {
        result.stdout += data.toString();
      });

      proc.stderr.on('data', (data: any) => 
      {
        result.stderr += data.toString();
      });

      proc.on('close', (exitCode: any) => 
      {
        resolve(result);
      });
    });
  }
}