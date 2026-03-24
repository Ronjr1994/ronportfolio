
const express = require('express');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 3000;

const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(__dirname, 'data');
const sitePath = path.join(dataDir, 'site.json');
const messagesPath = path.join(dataDir, 'messages.json');

app.use(express.json({limit:'1mb'}));
app.use(express.urlencoded({extended:true}));
app.use(express.static(publicDir));

app.get('/api/health', (req, res) => {
  res.json({ok:true, app:"ronworks-bolts-screenshot-clone"});
});

app.get('/api/site', async (req, res) => {
  try{
    const raw = await fsp.readFile(sitePath, 'utf8');
    res.type('application/json').send(raw);
  }catch(err){
    res.status(500).json({error:'Failed to load site data'});
  }
});

app.get('/api/messages', async (req, res) => {
  try{
    const raw = await fsp.readFile(messagesPath, 'utf8');
    res.type('application/json').send(raw);
  }catch(err){
    res.status(500).json({error:'Failed to load messages'});
  }
});

app.post('/api/contact', async (req, res) => {
  const {name, email, message} = req.body || {};
  if(!name || !email || !message){
    return res.status(400).json({error:'name, email, and message are required'});
  }
  const entry = {
    id: Date.now().toString(36),
    name,
    email,
    message,
    createdAt: new Date().toISOString()
  };
  try{
    let items = [];
    if(fs.existsSync(messagesPath)){
      items = JSON.parse(await fsp.readFile(messagesPath, 'utf8'));
    }
    items.push(entry);
    await fsp.writeFile(messagesPath, JSON.stringify(items, null, 2));
    res.status(201).json({ok:true, message:'Message saved', entry});
  }catch(err){
    res.status(500).json({error:'Failed to save message'});
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Ron Work's clone running at http://localhost:${PORT}`);
});
