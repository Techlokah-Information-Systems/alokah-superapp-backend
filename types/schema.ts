import { z } from "zod";
import {
  ItemTypeEnum,
  MetricsEnum,
  RolesEnum,
} from "../generated/prisma/client";

const inventoryItemBaseSchema = z.object({
  hotelId: z.cuid(),
  itemName: z.string().min(3, "Item Name is required"),
  sku: z.string().min(1, "SKU Cannot be empty"),
  price: z.number().positive({ message: "Price must be greater than 0" }),
  stock: z
    .number()
    .positive({ message: "Stock must be equal to or greater than 0" }),

  minOrderQuantity: z.number().positive(),
  minStockThreshold: z.number().positive(),
  metrics: z.enum(MetricsEnum),
  isHotItem: z.boolean().optional(),
  shelfLifeDays: z.number().positive(),
  itemType: z.enum(ItemTypeEnum),
  image: z.string().optional(),
});

const employeeBaseSchema = z.object({
  id: z.cuid().optional(),
  employeeCode: z.string().min(1, "Employee Code is required").optional(),
  hotelId: z.cuid(),
  userId: z.cuid().optional(),
  name: z.string().min(1, "Name is required"),
  contactId: z.cuid().optional(),
  role: z.enum(RolesEnum).optional(),
  password: z.string().min(6, "Password must be atleast six characters"),
});

export const createInventoryItemSchema = inventoryItemBaseSchema;
export const updateInventoryItemSchema = inventoryItemBaseSchema
  .partial()
  .refine(
    (data: any) =>
      Object.values(data).some((value: any) => value !== undefined),
    {
      message: "At least one field must be provided for update",
      path: [],
    }
  );

export const createEmployeeSchema = employeeBaseSchema;
export const updateEmployeeSchema = employeeBaseSchema
  .partial()
  .refine(
    (data: any) =>
      Object.values(data).some((value: any) => value !== undefined),
    {
      message: "At least one field must be provided for update",
      path: [],
    }
  );
