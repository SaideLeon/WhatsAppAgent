import express from 'express';
import bodyParser from 'body-parser';
import { serveDocx } from './utils/markdownToDocx';

const app = express();
app.use(bodyParser.json({ limit: '2mb' }));

app.post('/docx', serveDocx);

const PORT = process.env.DOCX_PORT || 3010;
app.listen(PORT, () => {
  console.log(`DOCX server running on port ${PORT}`);
});
