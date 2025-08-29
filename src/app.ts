import express from "express";
import routes from "./routes/index";
import bodyParser from "body-parser";

const app = express();
const PORT = 4000;
const ipAddress = '192.168.1.100';

app.use(bodyParser.json());
app.use("/api/", routes);
 app.get('/', (req, res) => {
      res.send('Hello from Node.js!');
    });
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});


