SHELL := /bin/bash

SOURCES = $(shell find src/control -name '*.js')
ASSETS = $(shell find src/view -name '*.png' -or -name '*.css')
ASSETS_DIST = $(shell echo $(ASSETS) | sed 's/src/dist\/public/g')
PUBLIC = $(shell find public)
PUBLIC_DIST = $(shell echo $(PUBLIC) | sed 's/public/dist\/public/g')
PUBLIC_NODE_MODULES = $(shell rsync -nmrv --include='*/' --include-from=public.modules.txt --exclude='*' node_modules dist/public/ | grep node_modules)
PUBLIC_NODE_MODULES_DIST = dist/public/node_modules

TARGET = dist/study-gen.js
CLIENT_DIST = dist/public/join/index.js \
	dist/public/logout/index.js \
	dist/public/studies/index.js \
	dist/public/studies/edit/index.js \
	dist/public/studies/edit/consent/index.js

browserify = node_modules/browserify/bin/cmd.js

.PHONY: all
all: $(TARGET) $(CLIENT_DIST) $(ASSETS_DIST) $(PUBLIC_NODE_MODULES_DIST) $(PUBLIC_DIST)

.PHONY: test
test: node_modules
	npm run test

.PHONY: clean
clean:
	rm -rf dist

.PHONY: distclean
distclean:
	rm -rf dist node_modules

.PHONY: start
start: $(TARGET)
	npm run start

.PHONY: app
app: $(TARGET)

.PHONY: client
client: $(CLIENT_DIST) $(ASSETS_DIST)

.PHONY: install
install: node_modules

node_modules:
	npm install

$(TARGET): node_modules $(SOURCES)
	npm run build

dist/public/join/index.js: $(wildcard src/view/join/*.js)
	mkdir -p $(shell dirname $@)
	$(browserify) $^ -o $@ -t babelify

dist/public/logout/index.js: $(wildcard src/view/logout/*.js)
	mkdir -p $(shell dirname $@)
	$(browserify) $^ -o $@ -t babelify

dist/public/studies/index.js: $(wildcard src/view/studies/*.js)
	mkdir -p $(shell dirname $@)
	$(browserify) $^ -o $@ -t babelify

dist/public/studies/edit/index.js: $(wildcard src/view/studies/edit/*.js)
	mkdir -p $(shell dirname $@)
	$(browserify) $^ -o $@ -t babelify

dist/public/studies/edit/consent/index.js: $(wildcard src/view/studies/edit/consent/*.js)
	mkdir -p $(shell dirname $@)
	$(browserify) $^ -o $@ -t babelify

$(ASSETS_DIST): $(ASSETS)
	rsync -mrv --include='*/' --include='*.png' --include='*.css' --exclude='*' src/ dist/public/

$(PUBLIC_NODE_MODULES_DIST): $(PUBLIC_NODE_MODULES)
	rsync -mrv --include='*/' --include-from=public.modules.txt --exclude='*' node_modules dist/public/
	touch $(PUBLIC_NODE_MODULES_DIST)

$(PUBLIC_DIST): $(PUBLIC)
	rsync -mrv public/ dist/public/
