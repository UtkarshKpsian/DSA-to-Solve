# Backend Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- Redis (optional, for session management)

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
MONGODB_URI=your_mongodb_connection_string_here

# JWT Configuration
JWT_KEY=your_jwt_secret_key_here

# Server Configuration
PORT=3000

# Redis Configuration (optional)
REDIS_URL=your_redis_url_here

# Judge0 API Configuration (for code execution)
JUDGE0_KEY=your_judge0_api_key_here

# Other configurations
NODE_ENV=development
```

## Judge0 API Setup

The application uses Judge0 API for code execution. To set this up:

1. Go to [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce/)
2. Subscribe to the API (free tier available)
3. Get your API key from the RapidAPI dashboard
4. Add the API key to your `.env` file as `JUDGE0_KEY`

### Troubleshooting Judge0 API Issues

If you encounter "Failed to get results from Judge0 API" errors:

1. **Check API Key**: Ensure your `JUDGE0_KEY` is correctly set in the `.env` file
2. **API Limits**: Free tier has rate limits. Check your RapidAPI usage
3. **Network Issues**: Ensure your server can reach the Judge0 API endpoints
4. **Skip Validation**: If Judge0 API is not configured, the system will skip code validation and still create problems

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## API Endpoints

- `POST /user/register` - User registration
- `POST /user/login` - User login
- `GET /user/check` - Check authentication status
- `GET /problem/getAllProblem` - Get all problems (public)
- `POST /problem/create` - Create new problem (admin only)
- `GET /problem/problemById/:id` - Get problem by ID
- `POST /submission/submit` - Submit solution

## Error Handling

The application includes comprehensive error handling for:
- Database connection issues
- Authentication failures
- Judge0 API errors
- Validation errors 