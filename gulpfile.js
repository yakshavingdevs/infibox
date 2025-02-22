import gulp from "gulp";
import esbuild from "gulp-esbuild";
import rename from "gulp-rename";
import clean from "gulp-clean";
import path from "path";

const config = {
  scriptTargets: {
    background: "src/background.js",
    content: "src/content.js",
    cmdk: "src/cmdk.js",
    options: "src/options.js",
    popup: "src/popup.js",
  },
  assetsGlob: "public/**/*",
  outputDirectory: "dist",
};

export const bundleScripts = () => {
  return gulp
    .src(Object.values(config.scriptTargets))
    .pipe(
      esbuild({
        bundle: true,
        minify: true, 
        format: "iife",
        outdir: "./",
        resolveExtensions: [".js"],
        alias: { "@": path.resolve("./src") },
      })
    )
    .pipe(rename({ extname: ".js" }))
    .pipe(gulp.dest(config.outputDirectory));
};

export const copyAssets = () => {
  return gulp
  .src(config.assetsGlob, { encoding: false })
  .pipe(gulp.dest(config.outputDirectory));
};

export const cleanOutputDirectory = () => {
  return gulp
  .src(config.outputDirectory, { allowEmpty: true })
  .pipe(clean());
};

export default gulp.series(
  cleanOutputDirectory,
  gulp.parallel(bundleScripts, copyAssets)
);