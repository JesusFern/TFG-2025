import { DietaResponse } from './diets';

export interface ApiResponse<T> {
  message?: string;
  [key: string]: T | string | undefined;
}

export interface ApiDietaResponse extends ApiResponse<DietaResponse> {
  dieta: DietaResponse;
}