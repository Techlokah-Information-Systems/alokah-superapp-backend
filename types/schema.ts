import { z } from "zod";
import {
  BusinessType,
  HotelTypeEnum,
  ItemTypeEnum,
  MetricsEnum,
  RolesEnum,
  UserScopeEnum,
  SecretsTypeEnum,
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

const hotelBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  logo: z.string().optional(),
  hotelType: z.enum(HotelTypeEnum),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  alternatePhone: z.string().optional(),
  alternatePhoneCountryCode: z.string().optional(),
  businessType: z.enum(BusinessType),
  isAccommodationAvailable: z.boolean().default(false),

  totalFloors: z.number().optional(),
  totalRooms: z.number().optional(),

  address: z.string().min(1, "Address is required"),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  locality: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal Code is required"),
  scope: z.enum(UserScopeEnum),
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

export const createHotelSchema = hotelBaseSchema;

export const createAlokahInventoryItemSchema = z.object({
  inventoryId: z.string().cuid("Inventory ID is required"),
  itemName: z.string().min(3, "Item Name is required"),
  sku: z.string().min(1, "SKU Cannot be empty"),
  price: z.number().positive({ message: "Price must be greater than 0" }),
  stock: z
    .number()
    .min(0, { message: "Stock must be equal to or greater than 0" }),
  minOrderQuantity: z.number().positive(),
  minStockThreshold: z.number().min(0).default(0),
  metrics: z.nativeEnum(MetricsEnum),
  isHotItem: z.boolean().optional(),
  shelfLifeDays: z.number().positive(),
  itemType: z.nativeEnum(ItemTypeEnum),
  image: z.string().optional(),
});

export const verifyOtpSchema = z
  .object({
    otp: z.string().min(1, "OTP is required"),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    accountType: z.string().optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone is required",
    path: ["email"],
  });

export const createAlokahUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  secret: z.string().min(1, "Secret is required"),
});

export const addSecretSchema = z.object({
  secret: z.string().min(1, "Secret is required"),
  type: z.nativeEnum(SecretsTypeEnum),
});
