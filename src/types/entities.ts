export interface GeoData {
  latitude: number;
  longitude: number;
  altitude: number;
  latitudeSpan: number;
  longitudeSpan: number;
}

export interface MediaItem {
  googleId: string,
  fileName:  string,
  filePath?: string,
  productUrl?: string,
  mimeType?: string,
  creationTime?: string,
  width?: number,
  height?: number
  orientation?: number,
  description?: string,
  geoData?: GeoData,
  imageViews?: number,
  people?: string[],
}
