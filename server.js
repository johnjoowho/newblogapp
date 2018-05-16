const express = require('express');

const app = express();

const blogPostRouter = require('./blogpostrouter');

app.use('/blog-posts', blogPostRouter); 

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});
