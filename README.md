# AnythingIoT - Cold Chain Monitoring System

A comprehensive IoT monitoring solution for cold chain logistics, providing real-time tracking of temperature, humidity, and other environmental conditions across supply chains.

## Tech Stack

### Mobile App (Expo/React Native)

#### Core Framework
- **Expo 54.0.1**: Managed workflow for React Native development
- **React Native 0.81.4**: Cross-platform mobile application framework
- **React 19.1.0**: UI library for building user interfaces

#### Navigation & UI Components
- **Expo Router 6.0.0**: File-based routing system
- **React Navigation 7.x**: Native navigation solution
- **React Native Bottom Tabs**: Tab-based navigation
- **React Native Screens & Safe Area Context**: Native navigation containers
- **React Native Reanimated 4.1.0**: Animation library for smooth UI
- **React Native Gesture Handler**: Gesture handling
- **React Native SVG**: Vector graphics support
- **React Native Skia**: High-performance 2D graphics
- **Moti**: Animation library

#### State Management & Data Fetching
- **Zustand 5.0.3**: Lightweight state management
- **TanStack Query 5.72.2**: Server state management and data fetching

#### Authentication & Security
- **Expo Secure Store**: Secure storage for sensitive data
- **Expo Auth Session**: Authentication session management

#### Media & File Handling
- **Expo Camera, Image Picker, Video**: Media capture and selection
- **Expo Audio/AV**: Audio/video playback
- **Uploadcare Client**: File uploading service
- **HTML-to-Image**: HTML to image conversion

#### Maps & Location
- **React Native Maps**: Map rendering
- **Expo Location**: Geolocation services
- **React Native Web Maps**: Web-compatible maps

#### Utilities
- **Date-fns 4.1.0**: Date manipulation
- **Lodash**: JavaScript utility functions
- **Color2k**: Color manipulation
- **Yup**: Schema validation

### Web App (React/React Router)

#### Core Framework
- **React 18.2.0** and **React DOM 18.2.0**: UI library
- **React Router 7.6.0**: Declarative routing
- **Vite 6.3.3**: Build tool and development server

#### Styling & UI Framework
- **Tailwind CSS 3**: Utility-first CSS framework
- **Chakra UI 2.8.2**: Accessible component library
- **Emotion**: CSS-in-JS library
- **Lucide React 0.358.0**: Icon library
- **Styled JSX**: CSS-in-JS solution

#### Backend & Authentication
- **Auth.js (NextAuth) Core 0.37.2**: Authentication solution
- **Hono Auth JS**: Hono-Auth.js integration
- **Argon2**: Password hashing
- **Neon Database Serverless**: Serverless PostgreSQL adapter

#### State Management & Data Fetching
- **TanStack Query 5.72.2**: Server state management
- **TanStack Table 8.21.2**: Headless table UI
- **Zustand 5.0.3**: Client-side state management

#### UI Components & Libraries
- **CMDK**: Command palette component
- **React Hook Form**: Form validation
- **React Resizable Panels**: Resizable panels
- **React Colorful**: Color picker
- **React Day Picker**: Date picker
- **Downshift**: Enhanced input components
- **Recharts**: Data visualization
- **Sonner**: Notifications

#### Maps & Visualization
- **Vis GL React Google Maps**: Google Maps integration
- **Three.js**: 3D graphics

#### Development & Build Tools
- **TypeScript**: Typed JavaScript
- **Babel**: JavaScript compiler
- **PostCSS & Autoprefixer**: CSS processing
- **Vitest**: Testing framework

#### Utilities
- **Date-fns 4.1.0**: Date manipulation
- **Lodash-es**: Modular utility library
- **Classnames**: CSS class name management
- **PapaParse**: CSV parsing

## Database

### Technology
- **Neon Database**: Serverless PostgreSQL database
- **@neondatabase/serverless**: Official Node.js driver for Neon

### Connection
- Uses serverless connection pooling via `Pool` from `@neondatabase/serverless`
- Configured through `DATABASE_URL` environment variable
- Custom adapter implementation for Auth.js integration

### Schema Structure

#### Authentication Tables
- `auth_users`: User account information
- `auth_accounts`: Account linking/provider details
- `auth_sessions`: User session management
- `auth_verification_token`: Email verification tokens

#### Application Tables
- `companies`: Organization entities
- `locations`: Physical locations associated with companies
- `user_profiles`: Extended user information including roles
- `devices`: IoT sensors/devices
- `sensor_data`: Environmental readings (temperature, humidity, electricity, door status)
- `alerts`: Threshold violation notifications
- `tickets`: Maintenance/service requests

### Features
- **Serverless Architecture**: Automatic scaling with demand
- **PostgreSQL Compatibility**: Full SQL support and PostgreSQL features
- **Connection Pooling**: Efficient database connection management
- **Environment-Based Configuration**: Flexible configuration via environment variables

## Industry Focus
Designed specifically for cold chain logistics in the supply chain industry, with specialized monitoring capabilities for:
- Temperature-sensitive shipments
- Humidity-controlled environments
- Real-time alerting for threshold violations
- Comprehensive reporting and analytics