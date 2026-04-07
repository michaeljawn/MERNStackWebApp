@echo off

echo Installing server dependencies...
cd server
npm install
cd ..

echo Installing client dependencies...
cd client
npm install
cd ..

echo Installation complete!