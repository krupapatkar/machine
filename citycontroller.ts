import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { City } from "../types/User";
import {handleSuccess ,handleError } from '../common/response';
import { messages  } from "../common/messages";



const prisma = new PrismaClient();

// Create City
export const createCity = async (req: Request, res: Response) : Promise<any> => {
  try {
    const { name, stateId }: City = req.body;

    const city = await prisma.city.create({
      data: { name, stateId },
    });
        return handleSuccess(res, city, messages.cityCreateSuccess);
  } catch (error) {
    return handleError(res, error,messages.cityCreateError);
  }
};

// Get City by ID
export const getCityById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        state: {
          include: { country: true }
        }
      },
    });
    return handleSuccess(res, city, messages.cityFetchSuccess);
  } catch (error) {
    return handleError(res, error, messages.cityFetchError);
  }
};

// Edit City
export const editCity = async (req: Request, res: Response): Promise<any> =>  {
  try {
    const { id } = req.params;
    const { name, stateId }: City = req.body;

    const city = await prisma.city.update({
      where: { id },
      data: { name, stateId },
    });

    return handleSuccess(res, city, messages.cityEditSuccess);
  } catch (error) {
    return handleError(res, error, messages.cityEditError);
  }
}
// Delete City

// DELETE City
export const deleteCity = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    await prisma.city.delete({
      where: { id },
    });

    return handleSuccess(res, null, messages.cityDeleteSuccess);
  } catch (error) {
    return handleError(res, error, messages.cityDeleteError);
  }
}

// export const deleteCity = async (req: Request, res: Response): Promise<any> =>       
// {
//   try {
//     const { id } = req.params;

//     await prisma.city.delete({
//       where: { id },
//     });

//     return handleSuccess(res, null, messages.cityDeleteSuccess);
//   } catch (error) {
//     return handleError(res, error, messages.cityDeleteError);
//   }
// }
