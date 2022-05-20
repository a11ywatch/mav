// extra configs for the image
export interface ImageConfig {
  width: number;
  height: number;
  imageBase64: string;
}

export interface ClassifyModelType {
  className: string;
  probability: number;
}
