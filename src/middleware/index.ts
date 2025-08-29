import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

// Body parser and CORS middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
