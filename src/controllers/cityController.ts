import { PrismaClient,Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { City,CityResponse ,CityDetailResponse,CityGetResponse} from "../types/City";
import { Pagination, PaginatedResponse } from "../types/Common";

import { handleSuccess, handleError } from "../common/response";
import { messages } from "../common/messages";

const prisma = new PrismaClient();

// Create City 
export const createCity = async (req: Request<any, any, City>,res: Response): Promise<any> => {
  try {
    const body: City = req.body;
    const trimmedName = (body.name || "").trim();

    // Validate city name
    if (!trimmedName) {
      return handleError(res, null, messages.cityNameRequired);
    }

    const namePattern = /^[A-Za-z\s]+$/;
    if (!namePattern.test(trimmedName)) {
      return handleError(res, null, messages.cityNameInvalid);
    }

    // Validate stateId presence
    if (!body.stateId) {
      return handleError(res, null, messages.stateIdRequired);
    }

    // Check if stateId exists
    const stateExists = await prisma.state.findUnique({
      where: { id: body.stateId },
    });

    if (!stateExists) {
      return handleError(res, null, messages.stateIDNotFound);
    }

    // Check for duplicate city in the same state
    const existingCity = await prisma.city.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
        stateId: body.stateId,
      },
    });

    if (existingCity) {
      return handleError(res, null, messages.cityAlreadyExists);
    }

    // Create city
    const newCity = await prisma.city.create({
      data: {name: trimmedName,stateId: body.stateId,},
    });

    // Format response
    const formatted: City = {id: newCity.id,name: newCity.name,stateId: newCity.stateId,};

    return handleSuccess(res, formatted, messages.cityCreateSuccess);
  } catch (error: any) {
    if (error.code === "P2003" && error.meta?.constraint === "City_stateId_fkey") {
      return handleError(res, null, messages.stateNotFound);
    }
    return handleError(res, error, messages.cityCreateError);
  }
};


//GET State,id and name
export const getCityId = async (req: Request<{ id: string }>,res: Response): Promise<any> => {
  try {
    const cityId = req.params.id;

    const city = await prisma.city.findUnique({
      where: { id: cityId },
      include: {
        state: true,
      },
    });

    if (!city) {
      return handleError(res, null, messages.cityIDNotFound);
    }

    const formatted: CityGetResponse = {
      id: city.id,
      name: city.name,
      stateId: city.stateId,
      statename: city.state?.name || "",
    };

    return handleSuccess(res, formatted, messages.cityFetchSuccess);
  } catch (error) {
    return handleError(res, error, messages.cityFetchError);
  }
};

// Get All Cities Select
export const getAllCities = async (req: Request<any, any>, res: Response): Promise<any> => {
  try {
    const { search } = req.body;
    const page = parseInt(req.body.page as string) || 1;
    const limit = parseInt(req.body.limit as string) || 10;
    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {};

    const [cities, total] = await Promise.all([
      prisma.city.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.city.count({
        where: whereClause,
      }),
    ]);

    const formatted: CityResponse[] = cities.map((item) => ({
      id: item.id,
      name: item.name,
      stateId: item.stateId,
    }));

    const totalPages = Math.ceil(total / limit);

    const responseData: PaginatedResponse<CityResponse> = {
      pagination: { page, limit, total, totalPages },
      data: formatted,
    };

    return handleSuccess(res, responseData, messages.cityListFetchedSuccess);
  } catch (error) {
    return handleError(res, error, messages.cityListFetchError);
  }
};

// Get City by ID
export const getCityById = async (req: Request<{ id: string }>,res: Response): Promise<any> => {
  try {
    const cityId = req.params.id;

    const city = await prisma.city.findUnique({
      where: { id: cityId },
      include: {
        state: true, // Fetch related state
      },
    });

    if (!city) {
      return handleError(res, null, messages.cityIDNotFound);
    }

    // Format response
    const formatted: CityDetailResponse = {id: city.id,name: city.name, };
      //created_at: city.created_at?.toISOString(),  };
   
    return handleSuccess(res, formatted, messages.cityListFetchedSuccess);
  } catch (error) {
    return handleError(res, error, messages.cityFetchError);
  }
};

// Edit City
export const editCity = async (req: Request<{ id: string }, {}, City>, res: Response): Promise<any> => {
  try {
    const cityId = req.params.id;
    const body: City = req.body;
    const trimmedName = body.name?.trim();

    // Name validation
    if (!trimmedName) {
      return handleError(res, null, messages.cityNameRequired);
    }

    const namePattern = /^[A-Za-z\s]+$/;
    if (!namePattern.test(trimmedName)) {
      return handleError(res, null, messages.cityNameInvalid);
    }

    // Check if city ID exists
    const currentCity = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!currentCity) {
      return handleError(res, null, messages.cityIDNotFound); 
    }

    // Same name check
    if (currentCity.name.toLowerCase() === trimmedName.toLowerCase()) {
      return handleError(res, null, messages.cityAlreadyExists);
    }

    // Validate state ID (optional but helpful)
    if (body.stateId) {
      const stateExists = await prisma.state.findUnique({
        where: { id: body.stateId },
      });

      if (!stateExists) {
        return handleError(res, null, messages.stateIDNotFound);
      }
    }

    // Duplicate name check in same state
    const duplicate = await prisma.city.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
        NOT: { id: cityId },
        stateId: body.stateId || currentCity.stateId,
      },
    });

    if (duplicate) {
      return handleError(res, null, messages.cityAlreadyExists);
    }

    // Update city
    const updated = await prisma.city.update({
      where: { id: cityId },
      data: {
        name: trimmedName,
        stateId: body.stateId || currentCity.stateId,
      },
    });

    // Format response
    const formatted: CityResponse = {id: updated.id,name: updated.name,stateId: updated.stateId,};

    return handleSuccess(res, formatted, messages.cityEditSuccess);
  } catch (error) {
    return handleError(res, error, messages.cityEditError);
  }
};

// Delete City
export const deleteCity = async (
  req: Request<{ id: string }, {}, City>,
  res: Response
): Promise<any> => {
  try {
    const cityId = req.params.id;

    const existingCity = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!existingCity) {
      return handleError(res, null, messages.cityIDNotFound);
    }

    await prisma.city.delete({
      where: { id: cityId },
    });

    return handleSuccess(res, null, messages.cityDeleteSuccess);
  } catch (error) {
    return handleError(res, error, messages.cityDeleteError);
  }
};
