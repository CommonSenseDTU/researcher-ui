SOURCES = $(shell find src -name '*.js' -not -regex '.*assets.*')
CLIENT_SOURCES = $(shell find src -regex '.*/assets/.*\.js')
CLIENT_DIST = $(shell echo $(CLIENT_SOURCES) | sed 's/src/dist\/public/g')
ASSETS = $(shell find src -name '*.png' -or -name '*.css')
ASSETS_DIST = $(shell echo $(ASSETS) | sed 's/src/dist\/public/g')
PUBLIC = $(shell find public)
PUBLIC_DIST = $(shell echo $(PUBLIC) | sed 's/public/dist\/public/g')
PUBLIC_NODE_MODULES = $(shell rsync -nmrv --include='*/' --include-from=public.modules.txt --exclude='*' node_modules dist/public/ | grep node_modules)
PUBLIC_NODE_MODULES_DIST = dist/public/node_modules
TARGET = dist/study-gen.js

.PHONY: all
all: $(TARGET) $(CLIENT_DIST) $(ASSETS_DIST) $(PUBLIC_NODE_MODULES_DIST) $(PUBLIC_DIST)

.PHONY: test
test:
	npm run test

.PHONY: clean
clean:
	rm -rf dist

.PHONY: start
start: $(TARGET)
	npm run start

$(TARGET): $(SOURCES)
	npm run build

$(CLIENT_DIST): $(CLIENT_SOURCES)
	npm run build-client

$(ASSETS_DIST): $(ASSETS)
	rsync -mrv --include='*/' --include='*.png' --include='*.css' --exclude='*' src/ dist/public/

$(PUBLIC_NODE_MODULES_DIST): $(PUBLIC_NODE_MODULES)
	rsync -mrv --include='*/' --include-from=public.modules.txt --exclude='*' node_modules dist/public/
	touch $(PUBLIC_NODE_MODULES_DIST)

$(PUBLIC_DIST): $(PUBLIC)
	rsync -mrv public/ dist/public/
