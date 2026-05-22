#!/bin/bash

# Terminal color codes for formatted output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

echo -e "${BLUE}${BOLD}======================================================${NC}"
echo -e "${BLUE}${BOLD}      VedaAI -- Live Reloading Dev Environment        ${NC}"
echo -e "${BLUE}${BOLD}======================================================${NC}"

# Step 1: Verify Docker daemon is running before proceeding
echo -e "\n${BLUE}[INFO] Checking Docker daemon status...${NC}"
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}[ERROR] Docker is not running or not accessible.${NC}"
  echo -e "${YELLOW}[WARN]  Please start Docker Desktop on your Mac and try again.${NC}"
  exit 1
fi
echo -e "${GREEN}[OK]   Docker is active and running.${NC}"

# Step 2: Spin up infrastructure and backend in Docker
echo -e "\n${BLUE}[INFO] Starting MongoDB, Redis, and Backend in Docker...${NC}"
docker compose up -d mongodb redis veda-backend

if [ $? -ne 0 ]; then
  echo -e "${RED}[ERROR] Failed to start backend/database containers.${NC}"
  exit 1
fi
echo -e "${GREEN}[OK]   Database and Backend started inside Docker.${NC}"

# Step 3: Free up host port 3000 by stopping the frontend container
echo -e "\n${BLUE}[INFO] Ensuring host port 3000 is free...${NC}"
docker compose stop veda-frontend > /dev/null 2>&1
echo -e "${GREEN}[OK]   Port 3000 is free and ready.${NC}"

# Step 4: Install frontend dependencies if needed, then start dev server
echo -e "\n${BLUE}[INFO] Preparing Next.js frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}[INFO] node_modules not found -- installing dependencies...${NC}"
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Failed to install frontend dependencies.${NC}"
    exit 1
  fi
  echo -e "${GREEN}[OK]   Dependencies installed.${NC}"
else
  echo -e "${GREEN}[OK]   Existing node_modules found.${NC}"
fi

echo -e "\n${GREEN}${BOLD}[INFO] Starting Next.js dev server with hot-reloading...${NC}"
echo -e "${YELLOW}[INFO] Edit files in your editor to see instant updates.${NC}"
echo -e "${BLUE}[INFO] URL: http://localhost:3000${NC}\n"

# Run dev server on port 3000
PORT=3000 npm run dev
