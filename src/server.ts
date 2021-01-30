import app from "./app";

const port = 3000;

const server = app.listen(port, (): void => {
  console.log(`Server listening on port ${port}!`);
});

export default server;
