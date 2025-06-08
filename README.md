# Turf Booking App

A complete mobile full-stack application for booking sports turfs, built with React Native (Expo) frontend and Node.js backend.

## Features

### For Users
- Sign up and login
- Browse available turfs
- Book time slots for any hour in the next 30 days
- View booking history
- Real-time slot availability

### For Turf Owners
- Register as turf owner with turf details
- Block time slots for offline bookings or maintenance
- Manage multiple turfs
- View occupied slots

## Tech Stack

**Frontend:**
- React Native with Expo
- React Navigation for routing
- AsyncStorage for token management
- Native components for UI

**Backend:**
- Node.js with Express
- MongoDB Atlas with Mongoose
- JWT authentication
- bcryptjs for password hashing
- CORS enabled for mobile requests

## Project Structure

\`\`\`
root/
├── backend/
│   ├── server.js        # All backend logic in single file
│   └── package.json
└── frontend/
    ├── App.js           # Main entry point with navigation
    ├── config.js        # Backend IP configuration
    ├── package.json
    └── screens/         # All UI screens
        ├── LoginScreen.js
        ├── RegisterScreen.js
        ├── HomeScreen.js
        ├── BookingScreen.js
        ├── MyBookingsScreen.js
        └── BlockSlotScreen.js
\`\`\`

## Setup Instructions

### Backend Setup

1. Navigate to backend folder:
   \`\`\`bash
   cd backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   # Create .env file with:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/turfbooking
   JWT_SECRET=your-secret-key
   PORT=3000
   \`\`\`

4. Start the server:
   \`\`\`bash
   npm start
   # or for development
   npm run dev
   \`\`\`

### Frontend Setup

1. Navigate to frontend folder:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Update backend IP in `config.js`:
   \`\`\`javascript
   export const BASE_URL = 'http://YOUR_IP_ADDRESS:3000';
   \`\`\`

4. Start Expo:
   \`\`\`bash
   npm start
   \`\`\`

5. Scan QR code with Expo Go app on your mobile device

## API Endpoints

- `POST /register` - User/Owner registration
- `POST /login` - User authentication
- `GET /turfs` - Get all turfs
- `POST /book` - Book a time slot
- `POST /block-slot` - Block time slot (owners only)
- `GET /mybookings` - Get user's bookings
- `GET /occupied` - Get occupied slots for a turf/date
- `GET /my-turfs` - Get owner's turfs

## Data Models

**User:** `{ _id, name, email, passwordHash, role }`
**Turf:** `{ _id, name, location, imageURL, ownerId }`
**Booking:** `{ _id, turfId, userId, date, startHour, endHour }`
**BlockedSlot:** `{ _id, turfId, date, startHour, endHour }`

## Usage

1. **Registration:** Choose between User or Turf Owner account
2. **For Owners:** Register turf details during signup
3. **Booking:** Select turf, date, and time slot
4. **Management:** View bookings and block slots as needed

## Network Configuration

- Backend runs on `0.0.0.0:3000` to accept connections from mobile devices
- Update `frontend/config.js` with your computer's local IP address
- Ensure both devices are on the same network

## Development Notes

- Uses Expo-compatible packages only
- Single backend file for simplicity
- JWT tokens stored in AsyncStorage
- Real-time slot conflict prevention
- Responsive design for mobile devices

## Troubleshooting

1. **Network Issues:** Ensure backend IP is correct in config.js
2. **Database Connection:** Verify MongoDB Atlas connection string
3. **Token Issues:** Clear AsyncStorage if authentication fails
4. **Expo Issues:** Try `expo r -c` to clear cache

## Future Enhancements

- Push notifications for booking confirmations
- Payment integration
- Rating and review system
- Advanced search and filtering
- Admin dashboard
- Booking cancellation feature
