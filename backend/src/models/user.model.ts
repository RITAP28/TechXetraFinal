import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const roleEnum = {
	USER: "USER",
	ADMIN: "ADMIN",
	MODERATOR: "MODERATOR",
} as const;

export const accountEnum = {
    EMAIL: "EMAIL",
    GOOGLE: "GOOGLE",
} as const;

export interface IUserEvent extends Document {
	eventId: mongoose.Schema.Types.ObjectId;
	paymentId: mongoose.Schema.Types.ObjectId;
	physicalVerification: {
		status: boolean;
		verifierId?: mongoose.Schema.Types.ObjectId;
	}
}

export interface IUser extends Document {
	_id: mongoose.Schema.Types.ObjectId;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	avatar: string;
	role: typeof roleEnum[keyof typeof roleEnum];
	account: Array<typeof accountEnum[keyof typeof accountEnum]>;
	college: string;
	phoneNumber: string;
	isVerified: boolean;
	isBlocked: boolean;
	events: IUserEvent[];
	googleId: string;
	refreshToken?: string;
	oneTimePassword?: string;
    oneTimeExpire?: Date;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
	createdAt: Date;
	updatedAt: Date;

	generateAccessToken(): string;
	generateRefreshToken(): string;
    comparePassword(enteredPassword: string): Promise<boolean>;
    getResetPasswordToken(): string;
    getOneTimePassword(): string;
}

const EventSchema: Schema<IUserEvent> = new Schema(
    {
		eventId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event",
            required: true,
		},
		paymentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Payment",
            required: true,
		},
		physicalVerification: {
			status: {
                type: Boolean,
                required: true,
                default: false,
            },
            verifierId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: function (this: IUserEvent) {
                    return this.physicalVerification && this.physicalVerification.status;
                },
            },
		}
	},
	{
		_id: false
	}
)

const UserSchema: Schema<IUser> = new Schema(
	{
		firstName: {
			type: String,
			required: [true, "First Name is required."],
			maxlength: [30, "First Name must be less than 30 characters."],
			minlength: [3, "First Name must be more than 3 characters."],
		},
		lastName: {
			type: String,
			required: [true, "Last Name is required."],
			maxlength: [30, "Last Name must be less than 30 characters."],
			minlength: [3, "Last Name must be more than 3 characters."],
		},
		password: {
			type: String,
			required: [true, "Password is required."],
			minlength: [6, "Password must be more than 6 characters."],
			select: false,
		},
		email: {
			type: String,
			required: [true, "Email is required."],
			unique: true,
			index: true,
			validate: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please fill a valid email address",
			],
		},
		avatar: String,
		role: {
			type: String,
			enum: Object.values(roleEnum),
			default: roleEnum.USER,
		},
		account: {
            type: [{
                type: String,
                enum: Object.values(accountEnum),
            }],
            default: [accountEnum.EMAIL],
        },
		college: {
			type: String,
			required: [true, "College is required."],
		},
		phoneNumber: {
			type: String,
			maxlength: [10, "Phone number must be less than 10 characters."],
			minlength: [10, "Phone number must be more than 10 characters."],
			required: [true, "Phone Number is required."],
		},
		isVerified: { 
			type: Boolean,
			default: false
		},
        isBlocked: { 
			type: Boolean,
			default: false
		},
		googleId: String,
		events: [EventSchema],
		refreshToken: String,
		oneTimePassword: String,
        oneTimeExpire: Date,
        resetPasswordToken: String,
        resetPasswordExpire: Date,
	},
	{ 
		timestamps: true
	}
);

// Password Hash
UserSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Access Token
UserSchema.methods.generateAccessToken = function (this: IUser) {
	const token = jwt.sign(
		{
			id: this._id,
			email: this.email,
            role: this.role,
		},
		process.env.ACCESS_TOKEN_SECRET!, 
		{ expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
	);
    return token;
};

// Refresh Token
UserSchema.methods.generateRefreshToken = function (this: IUser) {
	const token = jwt.sign(
		{ id: this._id },
		process.env.REFRESH_TOKEN_SECRET!,
		{ expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
	);
	this.refreshToken = token;
    return token;
};

// Compare Password
UserSchema.methods.comparePassword = async function (this: IUser, enteredPassword: string) {
    let isPasswordMatched;
    if (this.password) {
        isPasswordMatched = await bcrypt.compare(enteredPassword, this.password);
    }
    return isPasswordMatched;
};

// Generating Password Reset Token
UserSchema.methods.getResetPasswordToken = function (this: IUser) {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

    return resetToken;
};

// Generating One Time Password
UserSchema.methods.getOneTimePassword = function (this: IUser) {
    const otp = Math.floor(100000 + Math.random() * 900000);

    this.oneTimePassword = crypto
        .createHash("sha256")
        .update(otp.toString())
        .digest("hex");

    this.oneTimeExpire = new Date(Date.now() + 15 * 60 * 1000);

    return otp.toString();
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;