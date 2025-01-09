import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ENV } from "src/env";
import { Token, TokenDoc } from "src/models/token";
import { Password } from "src/services/password";

// An interface that describes the properties
// that are requried to create a new User
export interface UserAttrs {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isVerified?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

// An interface that describes the properties
// that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  // methods
  comparePassword(password: string): Promise<boolean>;
  generateJWT(): string;
  generatePasswordReset(): void;
  generateVerificationToken(): TokenDoc;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      max: 100,
    },
    lastName: {
      type: String,
      required: true,
      max: 100,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
    methods: {
      comparePassword(password: string): Promise<boolean> {
        return Password.compare(this.password, password);
      },
      generateJWT(): string {
        const payload = {
          id: this._id,
          email: this.email,
          firstName: this.firstName,
          lastName: this.lastName,
        };

        return jwt.sign(payload, ENV.JWT_KEY, {
          expiresIn: "30m",
        });
      },
      generatePasswordReset(): void {
        this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
        this.resetPasswordExpires = new Date(Date.now() + 3600000); //expires in an hour
      },
      generateVerificationToken(): TokenDoc {
        return Token.build({
          userId: this._id,
          token: crypto.randomBytes(20).toString("hex"),
        });
      },
    },
  }
);

// Hash password if modified or new
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }

  next();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User, UserDoc };
