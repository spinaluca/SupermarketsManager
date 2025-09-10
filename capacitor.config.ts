import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.st3pnymarket.app',
  appName: 'St3pnyMarket',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    hostname: 'api.st3pnymarket.mickysitiwp.it'
  }
};

export default config;
