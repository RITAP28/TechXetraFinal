import { Router } from "express";
import { authorizeRoles, isUserVerified, verifyToken } from "../middlewares/auth.middleware.js";
import {deleteUser, deleteUserEvents, getAllEvents, getAllUsers, getEventsRegistered, getUserById, getUsersInEvents, loginUser, migrateEligibilityFields, toggleAllIsVisible, toggleBlockUser, updatedUserRole } from "../controllers/admin.controller.js";
import { roleEnum } from "../models/user.model.js";

const router = Router();

router.route("/login").post(loginUser);
router.route("/users/all").get(verifyToken, isUserVerified, authorizeRoles(roleEnum.ADMIN, roleEnum.MODERATOR), getAllUsers);
router.route("/users/byId/:id")
    .get(verifyToken, isUserVerified, authorizeRoles(roleEnum.ADMIN, roleEnum.MODERATOR), getUserById)
    .delete(verifyToken, isUserVerified, authorizeRoles(roleEnum.ADMIN), deleteUser);
router.route("/users/block/:id").put(verifyToken, isUserVerified, authorizeRoles(roleEnum.ADMIN), toggleBlockUser);
router.route("/users/role/:id").put(verifyToken, isUserVerified, authorizeRoles(roleEnum.ADMIN), updatedUserRole);
router.route("/events/isVisible/all").put(verifyToken, isUserVerified, authorizeRoles(roleEnum.ADMIN), toggleAllIsVisible);
router.route("/users/event/:id").get(verifyToken, isUserVerified, authorizeRoles(roleEnum.ADMIN, roleEnum.MODERATOR), getUsersInEvents);
router.route("/events/all").get(verifyToken, isUserVerified, authorizeRoles(roleEnum.ADMIN, roleEnum.MODERATOR), getAllEvents);
router.route("/events/regi").get(verifyToken, isUserVerified, authorizeRoles(roleEnum.ADMIN, roleEnum.MODERATOR), getEventsRegistered);
router.route("/events/migrate").get(verifyToken, isUserVerified, authorizeRoles(roleEnum.ADMIN), migrateEligibilityFields);
router.route("/events/delete/:user/:id").delete(verifyToken, isUserVerified, authorizeRoles(roleEnum.ADMIN), deleteUserEvents);

export default router;