import mongoose from "mongoose";

// An interface that describes the properties that are requried to create a new User
interface TokenAttrs {
  userId: mongoose.Types.ObjectId;
  token: string;
}

// An interface that describes the properties that a token has
interface TokenModel extends mongoose.Model<TokenDoc> {
  build(attrs: TokenAttrs): TokenDoc;
}

// An interface that describes the properties that a Token Document has
interface TokenDoc extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  createdAt: Date;
}

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      expires: 43200,
    },
  },
  {
    timestamps: true,
  }
);

tokenSchema.statics.build = (attrs: TokenAttrs) => {
  return new Token(attrs);
};

const Token = mongoose.model<TokenDoc, TokenModel>("Token", tokenSchema);

export { Token, TokenDoc };
