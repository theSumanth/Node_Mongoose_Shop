const fs = require("fs");
const path = require("path");

const appDir = path.dirname(require.main.filename);

exports.appDir = appDir;

exports.deleteFile = (filePath) => {
  console.log("app directory ", appDir);
  const p = path.join(appDir, filePath);
  fs.unlink(p, (err) => {
    if (err) {
      throw new Error(err);
    }
  });
};
