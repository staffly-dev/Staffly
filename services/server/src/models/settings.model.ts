import { Schema, model, Document, Types } from 'mongoose';

export interface ISettings extends Document {
    userId: Types.ObjectId;
    appearance: 'light' | 'dark';
    language: string;
    twoFactorAuth: boolean;
    mobileNotifications: boolean;
    desktopNotifications: boolean;
    emailNotifications: boolean;
}

const settingsSchema = new Schema<ISettings>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appearance: { type: String, enum: ['light', 'dark'], default: 'light' },
    language: { type: String, default: 'en' },
    twoFactorAuth: { type: Boolean, default: false },
    mobileNotifications: { type: Boolean, default: true },
    desktopNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
});

export default model<ISettings>('Settings', settingsSchema);
