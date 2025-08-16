import settingsModel, { 
  ISettings, 
  INotificationSettings, 
  IAppearanceSettings, 
  IPrivacySettings, 
  IWorkspaceSettings 
} from "../../models/app/settings.model";
import { NotFoundException } from "../../utils/app-error";

const DEFAULT_SETTINGS = {
  notifications: {
    email: true,
    push: true,
    desktop: true,
    sound: true,
    frequency: 'immediately' as const
  },
  appearance: {
    theme: 'system' as const,
    fontSize: 'medium' as const,
    density: 'comfortable' as const,
    sidebarCollapsed: false
  },
  privacy: {
    profileVisibility: 'team' as const,
    activityStatus: 'online' as const,
    dataSharing: true,
    analytics: true
  },
  workspace: {
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h' as const,
    weekStartsOn: 0 as const,
    defaultView: 'list' as const
  },
  emailDigest: 'daily' as const,
  twoFactorAuth: false
};

export const getSettingsService = async (userId: string): Promise<ISettings> => {
  let settings = await settingsModel.findOne({ userId });
  
  if (!settings) {
    settings = await settingsModel.create({
      userId,
      ...DEFAULT_SETTINGS
    });
  }
  
  return settings;
};

export const updateSettingsService = async (
  userId: string, 
  updates: Partial<ISettings>
): Promise<ISettings> => {
  // Prevent updating userId
  const { userId: _, ...updateData } = updates as any;
  
  const settings = await settingsModel.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { 
      new: true, 
      upsert: true, 
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );
  
  if (!settings) {
    throw new NotFoundException('Settings not found');
  }
  
  return settings;
};

export const updatePartialSettingsService = async (
  userId: string,
  section: 'notifications' | 'appearance' | 'privacy' | 'workspace',
  updates: Partial<INotificationSettings | IAppearanceSettings | IPrivacySettings | IWorkspaceSettings>
): Promise<ISettings> => {
  const updatePath = section.startsWith('$') ? section : `settings.${section}`;
  
  const settings = await settingsModel.findOneAndUpdate(
    { userId },
    { $set: { [updatePath]: updates } },
    { new: true, upsert: true, runValidators: true }
  );
  
  if (!settings) {
    throw new NotFoundException('Settings not found');
  }
  
  return settings;
};

export const resetSettingsToDefault = async (userId: string): Promise<ISettings> => {
  return settingsModel.findOneAndUpdate(
    { userId },
    { $set: DEFAULT_SETTINGS },
    { new: true, upsert: true, runValidators: true }
  );
};