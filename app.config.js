module.exports = ({ config }) => ({
  ...config,
  ios: { ...config.ios, config: process.env.GOOGLE_MAPS_IOS_API_KEY
    ? { googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_API_KEY } : {} },
  android: { ...config.android, config: process.env.GOOGLE_MAPS_ANDROID_API_KEY
    ? { googleMaps: { apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY } } : {} },
});
