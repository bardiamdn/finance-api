# Finance Dashboard API

MadaniLab Finance API provides endpoints for managing financial transactions, user profiles, and spaces. It supports creating, retrieving, and updating financial data, user profiles, and spaces.

## Getting Started

### Installation

```bash
git clone https://github.com/bardiamdn/finance-api

cd finance-api

npm install
```

### Run the Server

```bash
npm run dev
```

### Create Image and Deploy Conatiner

```bash
docker-compose up -d # use --build and --force-recreate if needed
```

## End Points

### api/transactions:

**Required Fields**:

- userId: ObjectId (required)
- account: String (required)
- date: Date (required)
- amount: Number (required)
- type: String (required)
- category: String (required)
- details: String (required)
- submitDateTime: Date (required)

**Optional Fields**:

- space: String

Example Request: -> POST /api/transactions

```json
{
  "userId": "60c72b2f5b3c5b1d2f5b1e9a",
  "account": "Savings",
  "date": "2024-09-01T00:00:00Z",
  "amount": 150.0,
  "type": "Expense",
  "category": "Utilities",
  "details": "Electric bill payment",
  "submitDateTime": "2024-09-01T12:00:00Z"
}
```

### api/profile:

**Required Fields**:

- userId: ObjectId (required)
  **Optional Fields**:

- username: String
- profilePic: String (default)
- accounts: Array of Account Objects
- categories: Array of Category Objects
- lastSignin: Date
- createdAt: Date
- Account Object:
  - dateUpdated: Date
  - accountTitle: String
  - accountIco: String (default)
  - accountColor: String (default: '#ffffff')
  - accountBalance: String
  - listPriority: Number
  - createdAt: Date
- Category Object:
  - dateUpdated: Date
  - categoryTitle: String
  - categoryIcon: String (default)
  - categoryColor: String (default: '#ffffff')
  - categoryBalance: String
  - listPriority: Number
  - createdAt: Date

Example Request: -> POST /api/profile

```json
{
  "userId": "60c72b2f5b3c5b1d2f5b1e9a",
  "username": "john_doe",
  "profilePic": "<svg >...</svg>",
  "accounts": [
    {
      "dateUpdated": "2024-09-01T00:00:00Z",
      "accountTitle": "Main Account",
      "accountIco": "<svg >...</svg>",
      "accountColor": "#ff0000",
      "accountBalance": "500.00",
      "listPriority": 1,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "categories": [
    {
      "dateUpdated": "2024-09-01T00:00:00Z",
      "categoryTitle": "Groceries",
      "categoryIcon": "<svg >...</svg>",
      "categoryColor": "#00ff00",
      "categoryBalance": "200.00",
      "listPriority": 1,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "lastSignin": "2024-09-01T12:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### api/space:

**Required Fields**:

- userIds: Array of UserId Objects
- userId: ObjectId (required)
- usernames: Array of Username Objects
- username: String (required)
- spaceName: String (required)
  **Optional Fields**:

- spaceBalance: String
- admins: Array of Admin Objects

Example Request: -> POST /api/space

```json
{
  "userIds": [
    {
      "userId": "60c72b2f5b3c5b1d2f5b1e9a"
    }
  ],
  "usernames": [
    {
      "username": "john_doe"
    }
  ],
  "spaceName": "Finance Team",
  "spaceBalance": "1000.00",
  "admins": [
    {
      "admin": "60c72b2f5b3c5b1d2f5b1e9b"
    }
  ]
}
```
