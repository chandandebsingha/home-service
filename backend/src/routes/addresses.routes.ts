import { Router } from "express";
import { AddressController } from "../controllers/address.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import {
  validateRequest,
  Validators,
} from "../middleware/validation.middleware";

const router = Router();

router.get("/me", authenticateToken, AddressController.listMine);

router.post(
  "/",
  authenticateToken,
  validateRequest([
    {
      field: "street",
      validator: Validators.isString,
      message: "street must be a string",
    },
    {
      field: "city",
      validator: Validators.isString,
      message: "city must be a string",
    },
    {
      field: "state",
      validator: Validators.isString,
      message: "state must be a string",
    },
    {
      field: "pinCode",
      validator: Validators.isString,
      message: "pinCode must be a string",
    },
    {
      field: "country",
      validator: Validators.isString,
      message: "country must be a string",
    },
    {
      field: "apartment",
      validator: Validators.isString,
      message: "apartment must be a string",
      optional: true,
    },
    {
      field: "landmark",
      validator: Validators.isString,
      message: "landmark must be a string",
      optional: true,
    },
    {
      field: "latitude",
      validator: Validators.isNumber,
      message: "latitude must be a number",
      optional: true,
    },
    {
      field: "longitude",
      validator: Validators.isNumber,
      message: "longitude must be a number",
      optional: true,
    },
    {
      field: "isDefault",
      validator: Validators.isBoolean,
      message: "isDefault must be a boolean",
      optional: true,
    },
  ]),
  AddressController.create
);

router.put(
  "/:id",
  authenticateToken,
  validateRequest([
    {
      field: "street",
      validator: Validators.isString,
      message: "street must be a string",
      optional: true,
    },
    {
      field: "city",
      validator: Validators.isString,
      message: "city must be a string",
      optional: true,
    },
    {
      field: "state",
      validator: Validators.isString,
      message: "state must be a string",
      optional: true,
    },
    {
      field: "pinCode",
      validator: Validators.isString,
      message: "pinCode must be a string",
      optional: true,
    },
    {
      field: "country",
      validator: Validators.isString,
      message: "country must be a string",
      optional: true,
    },
    {
      field: "apartment",
      validator: Validators.isString,
      message: "apartment must be a string",
      optional: true,
    },
    {
      field: "landmark",
      validator: Validators.isString,
      message: "landmark must be a string",
      optional: true,
    },
    {
      field: "latitude",
      validator: Validators.isNumber,
      message: "latitude must be a number",
      optional: true,
    },
    {
      field: "longitude",
      validator: Validators.isNumber,
      message: "longitude must be a number",
      optional: true,
    },
    {
      field: "isDefault",
      validator: Validators.isBoolean,
      message: "isDefault must be a boolean",
      optional: true,
    },
  ]),
  AddressController.update
);

router.delete("/:id", authenticateToken, AddressController.remove);

export default router;
