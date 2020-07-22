import * as sharp from "sharp";

export interface ThumbnailSize {
  width: number;
  height: number;
  fit: keyof sharp.FitEnum;
}
