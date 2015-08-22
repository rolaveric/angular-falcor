import express from 'express';
import bodyParser from 'body-parser';
import FalcorServer from 'falcor-express';
import {todoRouterFactory} from './falcorRouter.js';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

// Simple middleware to handle get/post
app.use('/model.json', FalcorServer.dataSourceRoute(function(req, res) {
  console.log(`${req.method}: ${req.originalUrl}`);
  return todoRouterFactory();
}));

app.use('/', express.static('./public/'));

export const start = () => {
  return app.listen(9090, function(err) {
    if (err) {
      console.error(err);
      return;
    }
    console.log("navigate to http://localhost:9090");
  });
};