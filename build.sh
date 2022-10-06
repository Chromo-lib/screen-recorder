mkdir -p dist \
&& cp -r src/background dist \
&& cp src/manifest.json dist \
&& cp -r src/permission dist \
&& cp -r LICENSE dist \
&& cp -r src/icons dist \
&& cp -r src/popup/index.html dist/popup \
&& cp -r src/popup/record.svg dist/popup \
&& cp -r src/popup/style.css dist/popup