import { Injectable } from '@angular/core';
import { Mesh } from 'babylonjs/Meshes/mesh';
import { Container } from '../engine/common/Container';
import { LogLevel } from '../models/logModels/logLevel';
import { MeshLog } from '../models/logModels/meshLog';

@Injectable()
export class LogService {

  level: LogLevel = LogLevel.All;
  logWithDate: boolean = true;

  public bufferLogConsole: string[] = [];

  constructor() { }

  getDate(): string {
    return new Date().toTimeString();
  }
  public log(msg: any, _class: string, _action: string) {
    if (msg instanceof Container) msg = new MeshLog(<Mesh>msg.get());
    let logMessage = new Date().toLocaleTimeString() + " - " + JSON.stringify(msg) + " - [" + + _action + "] - " + _class;
    this.bufferLogConsole.push(logMessage);
  }

  private shouldLog(level: LogLevel): boolean {
    let ret: boolean = false;
    if ((level >= this.level &&
      level !== LogLevel.Off) ||
      this.level === LogLevel.All) {
      ret = true;
    }
    return ret;
  }

  private formatParams(params: any[]): string {
    let ret: string = params.join(",");
    // Is there at least one object in the array?
    if (params.some(p => typeof p == "object")) {
      ret = "";
      // Build comma-delimited string
      for (let item of params) {
        ret += JSON.stringify(item) + ",";
      }
    }
    return ret;
  }

}