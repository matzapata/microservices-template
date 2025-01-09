import { User, UserAttrs, UserDoc } from "src/models/user";

export class UserService {
  static getUserByEmail(email: string): Promise<UserDoc | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  static async createUser(user: UserAttrs): Promise<UserDoc> {
    const newUser = User.build({ ...user, email: user.email.toLowerCase() });
    await newUser.save();
    return newUser;
  }
}
