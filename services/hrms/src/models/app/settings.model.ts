import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface INotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  sound: boolean;
  frequency: 'immediately' | 'hourly' | 'daily' | 'weekly';
}

export interface IAppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'comfortable' | 'spacious';
  sidebarCollapsed: boolean;
}

export interface IPrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';
  activityStatus: 'online' | 'idle' | 'offline' | 'invisible';
  dataSharing: boolean;
  analytics: boolean;
}

export interface IWorkspaceSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  defaultView: 'list' | 'grid' | 'calendar';
}

export interface ISettings extends Document {
  userId: Types.ObjectId;
  notifications: INotificationSettings;
  appearance: IAppearanceSettings;
  privacy: IPrivacySettings;
  workspace: IWorkspaceSettings;
  emailDigest: 'never' | 'daily' | 'weekly';
  twoFactorAuth: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSettingsSchema = new Schema<INotificationSettings>({
  email: { type: Boolean, default: true },
  push: { type: Boolean, default: true },
  desktop: { type: Boolean, default: true },
  sound: { type: Boolean, default: true },
  frequency: { 
    type: String, 
    enum: ['immediately', 'hourly', 'daily', 'weekly'],
    default: 'immediately' 
  }
}, { _id: false });

const appearanceSettingsSchema = new Schema<IAppearanceSettings>({
  theme: { 
    type: String, 
    enum: ['light', 'dark', 'system'], 
    default: 'system' 
  },
  fontSize: { 
    type: String, 
    enum: ['small', 'medium', 'large'], 
    default: 'medium' 
  },
  density: { 
    type: String, 
    enum: ['compact', 'comfortable', 'spacious'], 
    default: 'comfortable' 
  },
  sidebarCollapsed: { type: Boolean, default: false }
}, { _id: false });

const privacySettingsSchema = new Schema<IPrivacySettings>({
  profileVisibility: { 
    type: String, 
    enum: ['public', 'team', 'private'], 
    default: 'team' 
  },
  activityStatus: { 
    type: String, 
    enum: ['online', 'idle', 'offline', 'invisible'], 
    default: 'online' 
  },
  dataSharing: { type: Boolean, default: true },
  analytics: { type: Boolean, default: true }
}, { _id: false });

const workspaceSettingsSchema = new Schema<IWorkspaceSettings>({
  timezone: { type: String, default: 'UTC' },
  dateFormat: { type: String, default: 'MM/DD/YYYY' },
  timeFormat: { 
    type: String, 
    enum: ['12h', '24h'], 
    default: '12h' 
  },
  weekStartsOn: { 
    type: Number, 
    enum: [0, 1, 2, 3, 4, 5, 6], 
    default: 0 
  },
  defaultView: { 
    type: String, 
    enum: ['list', 'grid', 'calendar'], 
    default: 'list' 
  }
}, { _id: false });

const settingsSchema = new Schema<ISettings>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  notifications: { type: notificationSettingsSchema, default: () => ({}) },
  appearance: { type: appearanceSettingsSchema, default: () => ({}) },
  privacy: { type: privacySettingsSchema, default: () => ({}) },
  workspace: { type: workspaceSettingsSchema, default: () => ({}) },
  emailDigest: { 
    type: String, 
    enum: ['never', 'daily', 'weekly'], 
    default: 'daily' 
  },
  twoFactorAuth: { type: Boolean, default: false }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const SettingsModel =
  (mongoose.models.Settings as mongoose.Model<ISettings>) ||
  model<ISettings>('Settings', settingsSchema);

export default SettingsModel;
