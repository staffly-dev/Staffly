import UserModel from "../../models/auth/user.model";
import { NotFoundException, UnauthorizedException } from "../../utils/app-error";
import { AccessTPayload, verifyJwtToken } from "../../utils/jwt";

export const getCurrentUserService = async (accessToken: string) => {
  const { payload } = verifyJwtToken<AccessTPayload>(accessToken);

  if (!payload) {
    throw new UnauthorizedException("Invalid access token unauthorized");
  }

  const user = await UserModel.findById(payload.userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture,
    designation: user.designation,
  }
}