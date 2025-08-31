

export interface UploadVideoDTO {
    url: string
    platform: VideoPlatforms
    title?: string
}

export enum VideoPlatforms {
    YOUTUBE = "youtube",
    VIMEO = "vimeo",
    LOCAL = "local",
  }
  