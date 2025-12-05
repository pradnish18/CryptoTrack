# JSON Server Setup

## Overview
This server uses **JSON Server** to provide a mock REST API for the CryptoTrack application.

## Installation
Already installed! Dependencies are in package.json.

## Running the Server

Start JSON Server on port 3001:
```bash
cd Server
npm run json-server
```

Or use the dev script:
```bash
npm run dev
```

## API Endpoints

JSON Server automatically creates RESTful endpoints based on db.json:

### Users
- GET    `/users` - Get all users
- GET    `/users/1` - Get user by ID
- POST   `/users` - Create new user
- PUT    `/users/1` - Update user
- PATCH  `/users/1` - Partial update
- DELETE `/users/1` - Delete user

### Watchlists
- GET    `/watchlists` - Get all watchlists
- GET    `/watchlists/1` - Get watchlist by ID
- POST   `/watchlists` - Create watchlist
- PUT    `/watchlists/1` - Update watchlist
- DELETE `/watchlists/1` - Delete watchlist

### Portfolios
- GET    `/portfolios` - Get all portfolios
- GET    `/portfolios/1` - Get portfolio by ID
- POST   `/portfolios` - Create portfolio
- PUT    `/portfolios/1` - Update portfolio
- DELETE `/portfolios/1` - Delete portfolio

## Example API Calls

### Get user's watchlist
```bash
curl http://localhost:3001/users/1
```

### Update portfolio
```bash
curl -X PUT http://localhost:3001/portfolios/1 \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "userId": 1,
    "holdings": {
      "bitcoin": {
        "totalInvestment": 6000,
        "coins": 0.12
      }
    }
  }'
```

### Add to watchlist
```bash
curl -X PATCH http://localhost:3001/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "watchlist": ["bitcoin", "ethereum", "cardano", "solana"]
  }'
```

## Features

- ✅ Full REST API with GET, POST, PUT, PATCH, DELETE
- ✅ Automatic endpoint generation from db.json
- ✅ Data persistence (changes saved to db.json)
- ✅ CORS enabled (works with React frontend)
- ✅ Filtering, sorting, pagination support
- ✅ Hot reload (watches db.json for changes)

## Query Parameters

### Filtering
```
GET /users?username=demo
```

### Pagination
```
GET /users?_page=1&_limit=10
```

### Sorting
```
GET /portfolios?_sort=id&_order=desc
```

### Full-text search
```
GET /users?q=demo
```

## Database File

Data is stored in `db.json`. You can edit this file directly, and changes will be reflected immediately (thanks to --watch flag).

## Port Configuration

Default port: `3001`  
Change port: `json-server --watch db.json --port YOUR_PORT`

## Integration with Client

To use this API in your React app:

```javascript
// Replace localStorage calls with API calls
const response = await fetch('http://localhost:3001/users/1');
const userData = await response.json();

// Update portfolio
await fetch('http://localhost:3001/portfolios/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedPortfolio)
});
```

## Sample Data

The `db.json` includes:
- 1 demo user
- Sample watchlist with 3 coins
- Sample portfolio with Bitcoin and Ethereum

Feel free to modify `db.json` to add more sample data!

## Troubleshooting

**Port already in use?**
```bash
# Use a different port
json-server --watch db.json --port 3002
```

**CORS issues?**
JSON Server has CORS enabled by default, so your React app can access it from localhost:5173.

---

**Documentation:** https://github.com/typicode/json-server
