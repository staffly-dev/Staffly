import settingsModel, { ISettings } from "../models/settings.model";



export const getSettingsService =  async (userId: string): Promise<ISettings | null> => {
    return await settingsModel.findOne({ userId });
};


export const updateSettingsService = async (userId: string, settings: ISettings): Promise<ISettings | null> => {
    return await settingsModel.findOneAndUpdate({ userId }, settings, { new: true , upsert: true , runValidators: true });
};