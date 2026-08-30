import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponseHandler";
import { StatusCodes } from "http-status-codes";
import * as shippingService from "../services/shipping.service";
import { validateBody } from "../utils/validate.utils";
import {
  calculateShippingSchema,
  shippingProfileCreateUpdateSchema,
  shippingProfileQuerySchema,
  shippingRuleCreateUpdateSchema,
  shippingZoneCreateUpdateSchema,
} from "../schemas/shipping.schema";

export const createShippingProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    const validatedBody = validateBody(
      shippingProfileCreateUpdateSchema,
      req.body,
    );

    const profile = await shippingService.createShippingProfile(
      storeId,
      validatedBody,
    );

    return res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(
          StatusCodes.CREATED,
          profile,
          "Shipping profile created successfully",
        ),
      );
  },
);

export const getShippingProfiles = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    const parsedQuery = shippingProfileQuerySchema.parse(req.query);

    const result = await shippingService.getShippingProfiles(
      storeId,
      parsedQuery,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          result,
          "Shipping profiles retrieved successfully",
        ),
      );
  },
);

export const getShippingProfileById = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, profileId } = req.params as {
      storeId: string;
      profileId: string;
    };

    const profile = await shippingService.getShippingProfileById(
      storeId,
      profileId,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          profile,
          "Shipping profile retrieved successfully",
        ),
      );
  },
);

export const updateShippingProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, profileId } = req.params as {
      storeId: string;
      profileId: string;
    };
    const validatedBody = validateBody(
      shippingProfileCreateUpdateSchema,
      req.body,
    );

    const profile = await shippingService.updateShippingProfile(
      storeId,
      profileId,
      validatedBody,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          profile,
          "Shipping profile updated successfully",
        ),
      );
  },
);

export const deleteShippingProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, profileId } = req.params as {
      storeId: string;
      profileId: string;
    };

    const result = await shippingService.deleteShippingProfile(
      storeId,
      profileId,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          result,
          "Shipping profile deleted successfully",
        ),
      );
  },
);

export const createShippingZone = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, profileId } = req.params as {
      storeId: string;
      profileId: string;
    };
    const validatedBody = validateBody(
      shippingZoneCreateUpdateSchema,
      req.body,
    );

    const zone = await shippingService.createShippingZone(
      storeId,
      profileId,
      validatedBody,
    );

    return res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(
          StatusCodes.CREATED,
          zone,
          "Shipping zone created successfully",
        ),
      );
  },
);

export const updateShippingZone = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, zoneId } = req.params as {
      storeId: string;
      zoneId: string;
    };
    const validatedBody = validateBody(
      shippingZoneCreateUpdateSchema,
      req.body,
    );

    const zone = await shippingService.updateShippingZone(
      storeId,
      zoneId,
      validatedBody,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          zone,
          "Shipping zone updated successfully",
        ),
      );
  },
);

export const deleteShippingZone = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, zoneId } = req.params as {
      storeId: string;
      zoneId: string;
    };

    const result = await shippingService.deleteShippingZone(storeId, zoneId);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          result,
          "Shipping zone deleted successfully",
        ),
      );
  },
);

export const createShippingRule = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    const validatedBody = validateBody(
      shippingRuleCreateUpdateSchema,
      req.body,
    );

    const rule = await shippingService.createShippingRule(
      storeId,
      validatedBody,
    );

    return res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(
          StatusCodes.CREATED,
          rule,
          "Shipping rule created successfully",
        ),
      );
  },
);

export const updateShippingRule = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, ruleId } = req.params as {
      storeId: string;
      ruleId: string;
    };
    const validatedBody = validateBody(
      shippingRuleCreateUpdateSchema,
      req.body,
    );

    const rule = await shippingService.updateShippingRule(
      storeId,
      ruleId,
      validatedBody,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          rule,
          "Shipping rule updated successfully",
        ),
      );
  },
);

export const deleteShippingRule = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId, ruleId } = req.params as {
      storeId: string;
      ruleId: string;
    };

    const result = await shippingService.deleteShippingRule(storeId, ruleId);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          result,
          "Shipping rule deleted successfully",
        ),
      );
  },
);

export const calculateShippingCharge = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    const validatedBody = validateBody(calculateShippingSchema, req.body);

    const calculation = await shippingService.calculateShippingCharge(
      storeId,
      validatedBody.shippingAddress,
      validatedBody.items,
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          calculation,
          "Shipping charge calculated successfully",
        ),
      );
  },
);
