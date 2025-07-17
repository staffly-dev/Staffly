import { Schema, model, Document, Types } from 'mongoose';

export interface ISettings extends Document {
    userId: Types.ObjectId;
    appearance: 'light' | 'dark';
    language: string;
    emailNotifications: boolean;
}

const settingsSchema = new Schema<ISettings>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appearance: { type: String, enum: ['light', 'dark'], default: 'light' },
    language: { type: String, default: 'en' },
    emailNotifications: { type: Boolean, default: true },
});

export default model<ISettings>('Settings', settingsSchema);
