const express = require('express')
const app = express();
const sqlite3 = require('sqlite3');
const path = require('path');
const db = path.resolve(__dirname, 'blog_platform.db');
const dbInstance=require('../dataBase/dataBase.js');

module.exports={db, dbInstance};