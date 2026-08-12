import { CustomerQuery } from "@prisma/client";

export interface CustomerQueryResponseDto {
  id: string;
  name: string;
  email: string;
  message: string;
  replied: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const toCustomerQueryDto = (
  query: CustomerQuery,
): CustomerQueryResponseDto => {
  return {
    id: query.id,
    name: query.name,
    email: query.email,
    message: query.message,
    replied: query.replied,
    createdAt: query.createdAt,
    updatedAt: query.updatedAt,
  };
};
