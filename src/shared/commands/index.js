import { base64Commands } from "./base64";
import { encodeDecodeCommands } from "./encode-decode";
import { hashCommand } from "./hash";
import { jsonCommands } from "./json";
import { numberCommands } from "./number";
import { stringCommands } from "./string";
import { textCommands } from "./text";
import { timeCommands } from "./time";

export const allUtilityCommands = [
  textCommands,
  base64Commands,
  numberCommands,
  jsonCommands,
  hashCommand,
  timeCommands,
  encodeDecodeCommands,
  stringCommands,
];