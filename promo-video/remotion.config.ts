import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(18);
Config.setOverwriteOutput(true);
Config.setBrowserExecutable(process.env.REMOTION_BROWSER ?? null);
