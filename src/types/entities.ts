export interface GeoData {
  latitude: number;
  longitude: number;
  altitude: number;
  latitudeSpan: number;
  longitudeSpan: number;
}

export interface Tag {
  id: string,
  label: string,
  type: string,
  avatarType: string;
  avatarId: string;
}

export interface MediaItem {
  googleId: string,
  fileName:  string,
  albumId: string;
  filePath?: string,
  productUrl?: string,
  baseUrl?: string,
  mimeType?: string,
  creationTime?: string,
  width?: number,
  height?: number
  orientation?: number,
  description?: string,
  geoData?: GeoData,
  people?: string[],
  tagIds: string[],
}

export enum TagSelectorType {
  Untagged = 'untagged',
  Tagged = 'tagged',
  TagList = 'tagList',
}

export enum TagSearchOperator {
  AND = 'AND',
  OR = 'OR',
}

export interface SearchSpec {
  matchRule: MatchRule;
  searchRules: SearchRule[];
}

export interface SearchRule {
  searchRuleType: SearchRuleType;
  searchRule: KeywordSearchRule | DateSearchRule;
}

export interface DateSearchRule {
  dateSearchRuleType: DateSearchRuleType;
  date: string;
  date2?: string;
}

export interface KeywordSearchRule {
  keywordSearchRuleType: KeywordSearchRuleType;
  keywordNodeId?: string;
}

export interface Keyword {
  keywordId: string;
  label: string;
  type: string;
}

export interface KeywordNode {
  nodeId: string;
  keywordId: string;
  parentNodeId: string;
  childrenNodeIds: string[];
}

export enum KeywordSearchRuleType {
  Contains = 'contains',
  AreEmpty = 'areEmpty',
  AreNotEmpty = 'areNotEmpty',
}

export enum DateSearchRuleType {
  IsInTheRange = 'isInTheRange',
  IsBefore = 'isBefore',
  IsAfter = 'isAfter',
}

export enum MatchRule {
  all = 'all',
  any = 'any',
}

export enum SearchRuleType {
  Keyword = 'keyword',
  Date = 'date',
}

