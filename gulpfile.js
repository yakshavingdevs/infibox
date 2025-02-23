import gulp from "gulp";
import esbuild from "gulp-esbuild";
import rename from "gulp-rename";
import clean from "gulp-clean";

const config = {
  scriptTargets: {
    background: "src/background/index.js",
    content: "src/content/index.js",
    options: "src/options/index.js",
    popup: "src/popup/index.js",
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
        minify: false, 
        format: "iife",
        outdir: "./js",
        resolveExtensions: [".js"],
      })
    )
    .on('error', (error) => console.log(error))
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