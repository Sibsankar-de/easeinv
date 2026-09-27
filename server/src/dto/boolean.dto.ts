export interface BooleanResponseDto {
  success: boolean;
}

export const toBooleanDto = (success: boolean = true): BooleanResponseDto => {
  return {
    success,
  };
};
