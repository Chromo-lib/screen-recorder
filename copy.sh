mkdir -p dist \
&& cp src/manifest.json dist \
&& cp -r LICENSE dist \
&& cp -r src/icons dist \
&& mkdir -p dist/popup \
&& cp -r src/popup/index.html dist/popup \
&& cp -r src/popup/record.svg dist/popup \
&& cp -r src/popup/style.css dist/popup \
&& cp -r src/permission/index.html dist