/* 
    This Controller is for managing hotel operation

    -- Registering A Hotel --
    -- Updating A Hotel --
    -- Adding an Inventory to a Hotel --
*/

import prisma from "../prisma/prisma";
import { Request, Response, NextFunction } from "express";
import catchAsync from "../middleware/catchAsyncError";
import { ContactForEnum } from "../generated/prisma/client";

type Contact = {
  id?: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  website: string;
  contactFor: ContactForEnum;
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
    const result = update
      ? await prisma.contact.update({
          where: {
            id: contact.id,
          },
          data: updatedData,
        })
      : await prisma.contact.create({
          data: {
            phone: contact.phone,
            alternatePhone: contact.alternatePhone,
            email: contact.email,
            website: contact.website,
          },
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
    const result = update
      ? await prisma.address.update({
          where: {
            id: address.id,
          },
          data: updatedData,
        })
      : await prisma.address.create({
          data: {
            address: address.address,
            district: address.district,
            state: address.state,
            locality: address.locality,
            country: address.country,
            postalCode: address.postalCode,
            hotelId: address.hotelId,
          },
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

// name: "done",
// hotelType: "done",
// logo: "done",
// phone: "done",
// email: "done",
// website: "done",
// alternatePhone: "done",
// alternatePhoneCountryCode: "",
// address: "done",
// district: "done",
// state: "done",
// postalCode: "done",
// locality: "done",
// country: "done",
// businessType: "done",
// isAccommodationAvailable: done,
// totalRooms: done,
// totalFloors: done,

export const registerHotel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      logo,
      hotelType,

      phone,
      alternatePhone,
      email,
      website,
      businessType,
      isAccommodationAvailable,
      totalFloors,
      totalRooms,

      address,
      district,
      state,
      locality,
      country,
      postalCode,

      scope,
    } = req.body;

    console.log("==========Hotel Registration==========");
    console.log("Name: ", name);
    console.log("Logo: ", logo);
    console.log("Hotel Type: ", hotelType);
    console.log("Phone: ", phone);
    console.log("Alternate Phone: ", alternatePhone);
    console.log("Email: ", email);
    console.log("Website: ", website);
    console.log("Business Type: ", businessType);
    console.log("Is Accommodation Available: ", isAccommodationAvailable);
    console.log("Total Floors: ", totalFloors);
    console.log("Total Rooms: ", totalRooms);
    console.log("Address: ", address);
    console.log("District: ", district);
    console.log("State: ", state);
    console.log("Locality: ", locality);
    console.log("Country: ", country);
    console.log("Postal Code: ", postalCode);
    console.log("========================================");

    if (isAccommodationAvailable) {
      if (!totalFloors || !totalRooms) {
        return res.status(400).send({
          success: false,
          message: "Total floors and total rooms are required",
        });
      }
    }

    if (
      !name ||
      !hotelType ||
      !address ||
      !district ||
      !state ||
      !country ||
      !postalCode ||
      !scope
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
      contactFor: ContactForEnum.Hotel,
    });

    const contactId = contact.id;
    const hotelCode = await generateHotelCode(name);

    try {
      const hotel = await prisma.hotel.create({
        data: {
          name: name,
          logo: logo,
          hotelCode: hotelCode,
          contactId: contactId,
          ownerId: user.id,
          hotelType: hotelType,
          type: businessType,
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

      if (isAccommodationAvailable) {
        await prisma.hotelAccommodation.create({
          data: {
            hotelId: hotel.id,
            totalFloors: totalFloors,
            totalRooms: totalRooms,
          },
        });
      }

      await prisma.inventory.create({
        data: {
          hotelId: hotel.id,
          inventoryCode: `INV-${hotelCode}`,
        },
      });

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          scope: scope,
          isRegistrationJourneyCompleted: true,
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
        error,
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
