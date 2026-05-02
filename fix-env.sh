#!/bin/bash
sed -i '' 's|VITE_API_URL=http://localhost:3000/api|VITE_API_URL=https://api.topsy.es/api|' ~/topsy-frontend/.env
cat ~/topsy-frontend/.env | grep VITE_API