import { prisma } from "../lib/prisma";
import { sendCustomerQueryEmail } from "./transactionalEmail.service";
import { toBooleanDto, BooleanResponseDto } from "../dto/boolean.dto";

export interface CreateCustomerQueryInput {
  name: string;
  email: string;
  message: string;
}

export const createCustomerQuery = async (
  data: CreateCustomerQueryInput,
): Promise<BooleanResponseDto> => {
  const { name, email, message } = data;

  await prisma.customerQuery.create({
    data: {
      name,
      email,
      message,
    },
  });

  await sendCustomerQueryEmail(name, email, message);

  return toBooleanDto(true);
};
