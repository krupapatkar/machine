import { PrismaClient,Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { State,StateResponse,StateDetailResponse,StategetResponse} from "../types/State";
import { Pagination, PaginatedResponse } from "../types/Common";

import { handleSuccess, handleError } from "../common/response";
import { messages } from "../common/messages";

const prisma = new PrismaClient();

// Create State
export const createState = async (req: Request<any, any, State>, res: Response): Promise<any> => {
  try {
    const body: State = req.body;
    const { ...stateInput } = body;

    const trimmedName = stateInput.name?.trim();

    // Validate name
    if (!trimmedName) {
      return handleError(res, null, messages.stateNameRequired);
    }

    const namePattern = /^[A-Za-z\s]+$/;
    if (!namePattern.test(trimmedName)) {
      return handleError(res, null, messages.stateNameInvalid);
    }

    // Validate countryId presence
    if (!stateInput.countryId) {
      return handleError(res, null, messages.countryIdRequired);
    }

    // Validate if countryId exists in Country table
    const countryExists = await prisma.country.findUnique({
      where: { id: stateInput.countryId },
    });

    if (!countryExists) {
      return handleError(res, null, messages.countryIDNotFound);
    }

    // Check for duplicate state in same country
    const existingState = await prisma.state.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
        countryId: stateInput.countryId,
      },
    });

    if (existingState) {
      return handleError(res, null, messages.stateAlreadyExists);
    }

    // Create the state
    const newState = await prisma.state.create({
      data: {
        ...stateInput,
        name: trimmedName,
      },
    });

    // Format response using interface
    const formatted: StateResponse = {id: newState.id,name: newState.name,countryId: newState.countryId,};

    return handleSuccess(res, formatted, messages.stateCreateSuccess);
  } catch (error: any) {
    if (error.code === "P2003" && error.meta?.constraint === "State_countryId_fkey") {
      return handleError(res, null, messages.countryIDNotFound);
    }
    return handleError(res, error, messages.stateCreateError);
  }
};


// Get All States Select
export const getAllStates = async (req: Request<any, any>, res: Response): Promise<any> => {
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

    const [states, total] = await Promise.all([
      prisma.state.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.state.count({
        where: whereClause,
      }),
    ]);

    const formatted: StateResponse[] = states.map((item) => ({
      id: item.id,
      name: item.name,
      countryId: item.countryId,

    }));

    const totalPages = Math.ceil(total / limit);

    const responseData: PaginatedResponse<StateResponse> = {
      pagination: { page, limit, total, totalPages },
      data: formatted,
    };

    return handleSuccess(res, responseData, messages.stateListFetchedSuccess);
  } catch (error) {
    return handleError(res, error, messages.stateListFetchError);
  }
};

// export const getAllStates = async (req: Request<any, any>, res: Response): Promise<any> => {
//   try {
//     const { search } = req.body;
//     const page = parseInt(req.body.page as string) || 1;
//     const limit = parseInt(req.body.limit as string) || 10;
//     const skip = (page - 1) * limit;

//     const whereClause = search
//       ? {
//           name: {
//             contains: search,
//             mode: "insensitive",
//           },
//         }
//       : {};

//     const [states, total] = await Promise.all([
//       prisma.state.findMany({
//         where: whereClause,
//         skip,
//         take: limit,
//         orderBy: {
//           createdAt: "desc",
//         },
//       }),
//       prisma.state.count({
//         where: whereClause,
//       }),
//     ]);

//     const formatted: StateResponse[] = states.map((item) => ({
//       id: item.id,
//       name: item.name,
//       countryId: item.countryId,
//     }));

//     const totalPages = Math.ceil(total / limit);

//     const responseData: PaginatedResponse<StateResponse> = {
//       pagination: { page, limit, total, totalPages },
//       data: formatted,
//     };

//     return handleSuccess(res, responseData, messages.stateListFetchedSuccess);
//   } catch (error) {
//     return handleError(res, error, messages.stateListFetchError);
//   }
// };

// export const getAllStates = async (req: Request<any, any>, res: Response): Promise<any> => {
//   try {
//     const { search } = req.body;
//     const page = parseInt(req.body.page as string) || 1;
//     const limit = parseInt(req.body.limit as string) || 10;
//     const skip = (page - 1) * limit;

//     const whereClause = search
//       ? {
//           name: {
//             contains: search,
//             mode: "insensitive",
//           },
//         }
//       : {};

//     const [states, total] = await Promise.all([
//       prisma.state.findMany({
//         where: whereClause,
//         skip,
//         take: limit,
//         orderBy: {
//           created_at: "desc", // ✅ use correct field from your schema
//         },
//       }),
//       prisma.state.count({
//         where: whereClause,
//       }),
//     ]);

//     const formatted: StateResponse[] = states.map((item) => ({
//       id: item.id,
//       name: item.name,
//       countryId: item.countryId,
//     }));

//     const totalPages = Math.ceil(total / limit);

//     const responseData: PaginatedResponse<StateResponse> = {
//       pagination: { page, limit, total, totalPages },
//       data: formatted,
//     };

//     return handleSuccess(res, responseData, messages.stateListFetchedSuccess);
//   } catch (error) {
//     console.error("Get All States Error:", error); // ✅ Add this for debugging
//     return handleError(res, error, messages.stateListFetchError);
//   }
// };


// Get State by ID
export const getStateById = async (req: Request<{ id: string }>,res: Response): Promise<any> => {
  try {
    const stateId = req.params.id;

    const state = await prisma.state.findUnique({
      where: { id: stateId },
      include: {
        cities: true,
        country: true,
      },
    });

    if (!state) {
      return handleError(res, null, messages.stateIDNotFound);
    }

    // Format response using interface
    const formatted: StateDetailResponse = {id: state.id,name: state.name,   };
      //created_at: state.created_at?.toISOString(),    };
 
    return handleSuccess(res, formatted, messages.stateFetchSuccess);
  } catch (error) {
    return handleError(res, error, messages.stateFetchError);
  }
};


//GET Country,id and name
export const getStateId = async (req: Request<{ id: string }>,res: Response): Promise<any> => {
  try {
    const stateId = req.params.id;

    const state = await prisma.state.findUnique({
      where: { id: stateId },
      include: {
        country: true,
      },
    });

    if (!state) {
      return handleError(res, null, messages.stateIDNotFound);
    }

    const formatted: StategetResponse = {
      id: state.id,
      name: state.name,
      countryId: state.countryId,
      countryname: state.country?.name || "",
    };

    return handleSuccess(res, formatted, messages.stateFetchSuccess);
  } catch (error) {
    return handleError(res, error, messages.stateFetchError);
  }
};

// Edit State
export const editState = async (req: Request<{ id: string }, {}, State>,res: Response): Promise<any> => {
  try {
    const stateId = req.params.id;
    const trimmedName = req.body.name?.trim();
    const countryId = req.body.countryId;

    // Validation: required name
    if (!trimmedName) {
      return handleError(res, null, messages.stateNameRequired);
    }

    // Validation: only alphabet and spaces
    const namePattern = /^[A-Za-z\s]+$/;
    if (!namePattern.test(trimmedName)) {
      return handleError(res, null, messages.stateNameInvalid);
    }

    // Check if state exists
    const current = await prisma.state.findUnique({
      where: { id: stateId },
    });

    if (!current) {
      return handleError(res, null, messages.stateIdNotFound);
    }

    // Check if provided countryId exists (if passed)
    if (countryId) {
      const existingCountry = await prisma.country.findUnique({
        where: { id: countryId },
      });

      if (!existingCountry) {
        return handleError(res, null, messages.countryIdNotFound); 
      }
    }

    // Same name check
    if (current.name.toLowerCase() === trimmedName.toLowerCase()) {
      return handleError(res, null, messages.stateAlreadyExists);
    }

    // Duplicate check for other states
    const duplicate = await prisma.state.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
        NOT: { id: stateId },
        countryId: countryId || current.countryId,
      },
    });

    if (duplicate) {
      return handleError(res, null, messages.stateAlreadyExists);
    }

    // Update state
    const updated = await prisma.state.update({
      where: { id: stateId },
      data: {
        name: trimmedName,
        countryId: countryId || current.countryId,
      },
    });

      const formatted: StateResponse = {id: updated.id,name: updated.name,countryId: updated.countryId,};

      return handleSuccess(res, formatted, messages.stateEditSuccess);
      } catch (error) {
        return handleError(res, error, messages.stateEditError);
      }
    };

// Delete State
export const deleteState = async (req: Request<{ id: string }, {}, State>,res: Response): Promise<any> => {
  try {
    const stateId = req.params.id;

    //Check if the state exists
    const existingState = await prisma.state.findUnique({
      where: { id: stateId },
    });

    if (!existingState) {
      return handleError(res, null, messages.stateIDNotFound);
    }

    // Delete all cities linked to this state
    await prisma.city.deleteMany({
      where: { stateId: stateId },
    });

    // Delete the state
    await prisma.state.delete({
      where: { id: stateId },
    });

    return handleSuccess(res, null, messages.stateDeletedSucess);
  } catch (error) {
    return handleError(res, error, messages.stateDeleteError);
  }
};
