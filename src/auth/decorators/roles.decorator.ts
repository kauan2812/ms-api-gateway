import { SetMetadata } from "@nestjs/common";

export const IS_ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(IS_ROLES_KEY, roles);
