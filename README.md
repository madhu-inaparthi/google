# Google OAuth Authentication Demo

A simple application demonstrating Google OAuth authentication using Express and Passport.js.

## Setup Instructions

1. **Clone the repository**

2. **Install dependencies**
   ```
   npm install
   ```

3. **Set up Google OAuth credentials**
   - Go to the [Google Developer Console](https://console.developers.google.com/)
   - Create a new project
   - Enable the Google+ API
   - Create OAuth 2.0 credentials
   - Set the authorized redirect URI to: `http://localhost:5000/auth/google/callback`

4. **Configure environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   YOUR_GOOGLE_CLIENT_ID=your_client_id_here
   YOUR_GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

5. **Start the server**
   ```
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## Features

- Google OAuth authentication
- Session management
- Simple user profile display

## Project Structure

- `server.js` - Main Express server setup
- `google/public/` - Static HTML files
  - `index.html` - Login page
  - `success.html` - Profile page after successful authentication