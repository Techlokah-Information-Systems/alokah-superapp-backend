/* 
    This Controller is for managing hotel operation

    -- Registering A Hotel --
    -- Updating A Hotel --
    -- Adding an Inventory to a Hotel --
*/

import prisma from "../prisma/prisma";
import { Request, Response, NextFunction } from "express";
import catchAsync from "../middleware/catchAsyncError";
import { Prisma } from "../generated/prisma/client";

type Contact = {
  id?: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  website: string;
};

type Address = {
  id?: string;
  hotelId: string;
  address: string;
  district: string;
  state: string;
  locality: string;
  country: string;
  postalCode: string;
};

type Hotel = {
  hotelCode: string;
  name: string;
  hotelTypeId?: string;
  logo?: string;
  address: string;
  contactId: string;
};

const addContactInformation = async (
  contact: Omit<Contact, "id"> & { id?: string },
  update: boolean = false
): Promise<Contact> => {
  const updatedData: any = {};
  if (update) {
    contact.phone && (updatedData["phone"] = contact.phone);
    contact.alternatePhone &&
      (updatedData["alternatePhone"] = contact.alternatePhone);
    contact.email && (updatedData["email"] = contact.email);
    contact.website && (updatedData["website"] = contact.website);
  }

  try {
    const result = !update
      ? await prisma.contact.create({
          data: {
            phone: contact.phone,
            alternatePhone: contact.alternatePhone,
            email: contact.email,
            website: contact.website,
          },
        })
      : await prisma.contact.update({
          where: {
            id: contact.id,
          },
          data: updatedData,
        });

    return result as Contact;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const addAddress = async (
  address: Omit<Address, "id"> & { id?: string },
  update: boolean = false
): Promise<Address> => {
  const updatedData: any = {};
  if (update) {
    address.address && (updatedData["address"] = address.address);
    address.district && (updatedData["district"] = address.district);
    address.state && (updatedData["state"] = address.state);
    address.locality && (updatedData["locality"] = address.locality);
    address.country && (updatedData["country"] = address.country);
    address.postalCode && (updatedData["postalCode"] = address.postalCode);
  }

  try {
    const result = !update
      ? await prisma.address.create({
          data: {
            address: address.address,
            district: address.district,
            state: address.state,
            locality: address.locality,
            country: address.country,
            postalCode: address.postalCode,
            hotelId: address.hotelId,
          },
        })
      : await prisma.address.update({
          where: {
            id: address.id,
          },
          data: updatedData,
        });

    return result as Address;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const generateHotelCode = async (hotelName: string) => {
  const prefix = "ALO";
  const first4Chars = hotelName.slice(0, 4).toUpperCase();

  while (true) {
    const random4Numbers = Math.ceil(Math.random() * 10000);
    const hotelCode = `${prefix}${first4Chars}${random4Numbers}`;

    const existing = await prisma.hotel.findFirst({
      where: {
        hotelCode: hotelCode,
      },
    });

    if (!existing) return hotelCode;
  }
};

export const registerHotel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      logo,
      address: rawAddress,
      hotelType,

      phone,
      alternatePhone,
      email,
      website,
    } = req.body;

    if (!rawAddress)
      return res.status(400).send({
        success: false,
        message: "Address is required",
      });

    const { address, district, state, locality, country, postalCode } =
      rawAddress;

    if (
      !name ||
      !hotelType ||
      !address ||
      !district ||
      !state ||
      !country ||
      !postalCode
    ) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }

    const user = req.user;
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User not found",
      });
    }

    const existingContact = await prisma.contact.findFirst({
      where: {
        OR: [
          {
            phone: phone,
          },
          {
            email: email,
          },
          {
            website: website,
          },
        ],
      },
    });

    if (existingContact) {
      return res.status(400).send({
        success: false,
        message: "Contact already exists",
      });
    }

    const contact: Contact = await addContactInformation({
      phone,
      alternatePhone,
      email,
      website,
    });

    const contactId = contact.id;
    const hotelCode = await generateHotelCode(name);

    try {
      const hotel = await prisma.hotel.create({
        data: {
          name: name,
          logo: logo ? logo : null,
          hotelCode: hotelCode,
          contactId: contactId,
          ownerId: user.id,
          hotelType: hotelType,
        },
      });

      const addressObj = await addAddress({
        address,
        district,
        state,
        locality,
        country,
        postalCode,
        hotelId: hotel.id,
      });

      await prisma.inventory.create({
        data: {
          hotelId: hotel.id,
          inventoryCode: `INV-${hotelCode}`,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Hotel created successfully",
        data: {
          hotel,
          contact,
          address: addressObj,
        },
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: "Something went wrong",
      });
    }
  }
);

export const getHotel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const hotel = await prisma.hotel.findFirst({
      where: {
        ownerId: id,
      },
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Could not find the hotel",
      });
    }

    return res.status(200).json({
      success: true,
      hotel,
    });
  }
);
