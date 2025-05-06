import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

const userDir = path.join(os.homedir(), '.xyz-newsletter');
const userFile = path.join(userDir, 'subscriber.json');

function getUserData() {
  try {
    if (fs.existsSync(userFile)) {
      const data = fs.readFileSync(userFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading user data:', error);
  }
  return { id: uuidv4() }; // Always return an object with an ID
}

function saveUserData(userData) {
  try {
    fs.mkdirSync(userDir, { recursive: true });
    fs.writeFileSync(userFile, JSON.stringify(userData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
}

function getOrCreateUserId() {
  const userData = getUserData();
  return userData.id;
}

function getUserEmail() {
  const userData = getUserData();
  return userData?.email || null;
}

function getUserName() {
  const userData = getUserData();
  return userData?.name || null;
}

function saveUserInfo(name, email) {
  const userData = getUserData();
  userData.name = name;
  userData.email = email;
  userData.infoUpdated = new Date().toISOString();
  // Do NOT change userData.id!
  saveUserData(userData);
  return userData;
}

// Keep for backward compatibility
function saveUserEmail(email) {
  const userData = getUserData();
  const name = userData.name || '';
  return saveUserInfo(name, email);
}

export { 
  getOrCreateUserId,
  getUserEmail,
  getUserName,
  saveUserEmail,
  saveUserInfo,
  getUserData
};