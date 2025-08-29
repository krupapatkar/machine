// src/controllers/countryController.ts
import { PrismaClient,Prisma  } from "@prisma/client";
import { Request, Response } from "express";
import { Country, CountryResponse,GetCountyResponse  } from "../types/Country";
import { Pagination, PaginatedResponse } from "../types/Common";
import { handleSuccess, handleError } from '../common/response';
import { messages } from "../common/messages";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient(); 

// Create Country
export const createCountry = async (req: Request<any, any, Country>, res: Response): Promise<any> => {
  try {
    const data: Country = req.body;
    const { ...country } = data;

    const trimmedName = country.name?.trim();

    // Validation: empty
    if (!trimmedName) {
      return handleError(res, null, messages.countryNameRequired);
    }

    // Validation: only letters & spaces
    const namePattern = /^[A-Za-z\s]+$/;
    if (!namePattern.test(trimmedName)) {
      return handleError(res, null, messages.countryNameInvalid);
    }

    // Check if already exists
    const existing = await prisma.country.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return handleError(res, null, messages.countryAlreadyExists);
    }

    // Create using spread
    const newCountry = await prisma.country.create({
      data: {
        ...country,
        name: trimmedName,
      },
    });

    const responseData: Country = {
      id: newCountry.id, name: newCountry.name,
    };

    return handleSuccess(res, responseData, messages.countryCreateSuccess);
  } catch (error) {
    return handleError(res, error, messages.countryCreateError);
  }
}


// Get All Countries Select
export const getAllUsers = async (req: Request<any, any>, res: Response): Promise<any> => {
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

    const [country, total] = await Promise.all([
      prisma.country.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.country.count({
        where: whereClause,
      }),
    ]);

    const formatted: CountryResponse[] = country.map((item) => ({
      id: item.id,
      name: item.name,
    }));

    const totalPages = Math.ceil(total / limit);

    const responseData: PaginatedResponse<CountryResponse> = {
      pagination: { page, limit, total, totalPages },
      data: formatted,
    };

    return handleSuccess(res, responseData, messages.countryListFetchedSuccess);
  } catch (error) {
    return handleError(res, error, messages.countryListFetchError);
  }
};


// Get All Countries Select(Country code)
// export const getAllUsers = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { search } = req.body;
//     const page = parseInt(req.body.page as string) || 1;
//     const limit = parseInt(req.body.limit as string) || 10;
//     const skip = (page - 1) * limit;

//     const whereClause = search
//       ? {
//           name: {
//             contains: search,
//             mode: Prisma.QueryMode.insensitive,
//           },
//         }
//       : {};

//     const [users, total] = await Promise.all([
//       prisma.user.findMany({
//         where: whereClause,
//         skip,
//         take: limit,
//         orderBy: { createdAt: "desc" },
//         include: {
//           country: true,
//           state: true,
//           city: true,
//         },
//       }),
//       prisma.user.count({ where: whereClause }),
//     ]);

//     const formatted: GetCountyResponse[] = users.map((user) => ({
//       id: user.id,
//       countryCode: user.countryCode || "",
//       countryName: user.country?.name || "",
//     }));

//     const totalPages = Math.ceil(total / limit);

//     const responseData: PaginatedResponse<GetCountyResponse> = {
//       pagination: { page, limit, total, totalPages },
//       data: formatted,
//     };

//     return handleSuccess(res, responseData, messages.userFetchSuccess);
//   } catch (error: any) {
//     return handleError(res, error, messages.userFetchError);
//   }
// };


// Get Country by ID
export const getCountryById = async (req: Request<{ id: string }>, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const result = await prisma.country.findUnique({
      where: { id },
    });

    if (!result) {
      return handleError(res, null, messages.countryIDNotFound);
    }

    // Return only fields defined in Country interface
    const { id: countryId, name }: Country = result;

    const country: Country = {
      id: countryId, name,
    };

    return handleSuccess(res, country, messages.countryFetchSuccess);
  } catch (error) {
    return handleError(res, error, messages.countryFetchError);
  }
};

// Edit Country
export const editCountry = async (req: Request<{ id: string }, {}, Country>, res: Response): Promise<any> => {
  try {
    const countryId = req.params.id;
    const data: Country = req.body;
    const { ...country } = data;

    const trimmedName = country.name?.trim();

    // Validation: name required
    if (!trimmedName) {
      return handleError(res, null, messages.countryNameRequired);
    }

    // Validation: only letters and spaces
    const namePattern = /^[A-Za-z\s]+$/;
    if (!namePattern.test(trimmedName)) {
      return handleError(res, null, messages.countryNameInvalid);
    }

    // Check if country exists
    const current = await prisma.country.findUnique({
      where: { id: countryId },
    });

    if (!current) {
      return handleError(res, null, messages.countryIDNotFound);
    }

    // Same name check
    if (current.name.toLowerCase() === trimmedName.toLowerCase()) {
      return handleError(res, null, messages.countryAlreadyExists);
    }

    // Duplicate check (excluding current)
    const duplicate = await prisma.country.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
        NOT: { id: countryId },
      },
    });

    if (duplicate) {
      return handleError(res, null, messages.countryAlreadyExists);
    }

    // Update country using spread + trimmedName
    const updated = await prisma.country.update({
      where: { id: countryId },
      data: {
        ...country,
        name: trimmedName,
      },
    });

    // Format response using interface
    const formatted: CountryResponse = {
      id: updated.id, name: updated.name,
    };

    return handleSuccess(res, formatted, messages.countryEditSuccess);
  } catch (error: any) {
    if (error.code === "P2002") {
      return handleError(res, null, messages.countryAlreadyExists);
    }
    return handleError(res, error, messages.countryEditError);
  }
};


//Delete Country
export const deleteCountry = async (req: Request<{ id: string }>, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // Check if country exists
    const existingCountry = await prisma.country.findUnique({
      where: { id },
    });

    if (!existingCountry) {
      return handleSuccess(res, null, messages.countryNOTFound);
    }

    // Get states and related cities
    const states = await prisma.state.findMany({
      where: { countryId: id },
      include: { cities: true },
    });

    // Delete cities under all states
    for (const state of states) {
      await prisma.city.deleteMany({
        where: { stateId: state.id },
      });
    }

    // Delete states under the country
    await prisma.state.deleteMany({
      where: { countryId: id },
    });

    // Delete the country
    await prisma.country.delete({
      where: { id },
    });

    return handleSuccess(res, null, messages.countryDeleteSuccess);
  } catch (error) {
    return handleError(res, error, messages.countryDeleteError);
  }
};



