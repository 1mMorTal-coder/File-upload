const express = require("express"); // Express Web Server
const busboy = require("connect-busboy"); // Middleware to handle the file upload https://github.com/mscdex/connect-busboy
const path = require("path"); // Used for manipulation with path
const fs = require("fs-extra"); // Classic fs

const port = process.env.PORT || 3000;

const app = express(); // Initialize the express web server
app.use(
  busboy({
    highWaterMark: 2 * 1024 * 1024, // Set 2MiB buffer
  })
); // Insert the busboy middle-ware

const uploadPath = path.join(__dirname, "fu/"); // Register the upload path
fs.ensureDir(uploadPath); // Make sure that he upload path exits

/**
 * Create route /upload which handles the post request
 */
app.route("/upload").post((req, res, next) => {
  req.pipe(req.busboy); // Pipe it trough busboy

  req.busboy.on("file", (fieldname, file, filename) => {
    console.log(`Upload of '${filename}' started`);

    // Create a write stream of the new file
    const fstream = fs.createWriteStream(path.join(uploadPath, filename));
    // Pipe it trough
    file.pipe(fstream);

    // On finish of the upload
    fstream.on("close", () => {
      console.log(`Upload of '${filename}' finished`);
      fs.createReadStream(`./fu/${filename}`).pipe(res);
    });
  });
});

/**
 * Serve the basic index.html with upload form
 */
app.route("/").get((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<body style='background-color:#122112; color:#fff'>");
  res.write(
    '<form action="upload" method="post" enctype="multipart/form-data">'
  );
  res.write('<input type="file" name="fileToUpload"><br>');
  res.write('<input type="submit">');
  res.write("</form>");
  res.write("</body>");
  return res.end();
});

const server = app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
