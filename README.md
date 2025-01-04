# Finance Dashboard API

CrunchCat API provides endpoints for managing financial transactions, user profiles, and spaces. It supports creating, retrieving, and updating financial data, user profiles, and spaces.

## Getting Started

### Installation

```bash
git clone https://github.com/bardiamdn/finance-api

cd finance-api

npm install
```

Before running the server or containerizing it, ensure you have a running MongoDB server, and add its URL to your .env file as shown in the .env.example file.

Then, generate a public and private key by running:

```bash
node keypairs/generateKeypair
```

### Run the Server

```bash
npm run dev
```

### Create Image and Deploy Conatiner

```bash
docker-compose up -d # use --build and --force-recreate if needed
```
