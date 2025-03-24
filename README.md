# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## API Configuration

This app connects to a backend API to fetch and manage inventory data. The API configuration is stored in a persistent configuration system.

### Installation Requirements

Before running the app, you need to install the AsyncStorage package:

```bash
npm install @react-native-async-storage/async-storage
```

### Configuration System

The app uses a configuration system that allows you to:

1. Configure the API host for different environments (development, staging, production)
2. Persist configuration changes between app sessions using AsyncStorage
3. Update configuration at runtime through a configuration screen

### Accessing the Configuration Screen

To access the configuration screen:

1. Navigate to `/config` in the app
2. The screen displays the current environment and API host
3. You can update the API host and save the changes
4. Changes take effect immediately

### Programmatic Configuration

You can also update the API configuration programmatically:

```typescript
import { updateApiHost, initializeApiConfig } from '@/constants/ApiConfig';

// Initialize the API configuration (call this when your app starts)
await initializeApiConfig();

// Update the API host
await updateApiHost('https://new-api.example.com');
```

### Default Configuration

The app comes with default configuration for each environment:

- Development: `https://dev-api.example.com`
- Staging: `https://staging-api.example.com`
- Production: `https://api.example.com`

### Changing the Environment

To change the current environment, modify the `getCurrentEnvironment` function in `constants/ApiConfig.ts`:

```typescript
export const getCurrentEnvironment = (): Environment => {
  // For demo purposes, default to development
  // In a real app, you might use process.env.NODE_ENV or similar
  return 'development'; // Change to 'staging' or 'production'
};
```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
