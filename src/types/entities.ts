export interface MediaItem {
  googleId: string,
  fileName:  string,
  filePath?: string,
  baseUrl?: string,
  productUrl?: string,
  mimeType?: string,
  creationTime?: string,
  width?: number,
  height?: number
  orientation?: number,
  description?: string,
  gpsPosition?: string,
  geoData?: any,
  imageViews?: number,
  people?: any[],
  photoTakenTime?: any,
  title?: string,
  url?: string,
}