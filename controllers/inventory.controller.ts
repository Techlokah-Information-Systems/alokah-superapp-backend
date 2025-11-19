import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/prisma";
import catchAsync from "../middleware/catchAsyncError";
import { z } from "zod";
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
} from "../types/schema";

// Adding Item to the inventory -> /inventory/add
export const addItemToInventory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const body: z.infer<typeof createInventoryItemSchema> = req.body;

    const {
      isHotItem,
      hotelId,
      price,
      sku,
      minOrderQuantity,
      metrics,
      minStockThreshold,
      itemName,
      itemType,
    } = body;

    const hotel = await prisma.hotel.findFirst({
      where: {
        AND: [
          {
            id: hotelId,
          },
          {
            ownerId: user?.id,
          },
        ],
      },
    });

    if (!hotel) {
      return res.status(403).json({
        success: false,
        message:
          "Hotel could not be found or You are not authorized to access this hotel",
      });
    }

    const inventory = await prisma.inventory.findFirst({
      where: {
        hotelId: hotel.id,
      },
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory could not be found.",
      });
    }

    const item = await prisma.inventoryItem.create({
      data: {
        inventoryId: inventory?.id,
        ...body,
      },
    });

    res.status(201).json({
      success: true,
      message: `${itemName} successfully added.`,
      item,
    });
  }
);

// Updating item in inventory -> /inventory/item/:id
export const updateInventoryItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const body: z.infer<typeof updateInventoryItemSchema> = req.body;

    console.log(body);

    if (!body) {
      return res.status(400).json({
        success: false,
        message: "Atleast one field is required to update",
      });
    }

    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        id: id,
        hotel: {
          ownerId: userId,
        },
      },
    });

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: "Item could not be found",
      });
    }

    const item = await prisma.inventoryItem.update({
      where: {
        id: id,
        hotel: {
          ownerId: userId,
        },
      },
      data: body,
    });

    return res.status(200).json({
      success: true,
      message: "Product has been succesfully updated",
      item,
    });
  }
);

// Deleting item from inventory -> /inventory/item/:id
export const deleteInventoryItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        id: id,
        hotel: {
          ownerId: userId,
        },
      },
    });

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: "Item could not be found",
      });
    }

    const result = await prisma.inventoryItem.delete({
      where: {
        id: id,
        hotel: {
          ownerId: userId,
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Item has been succesfully deleted",
      item: result,
    });
  }
);
