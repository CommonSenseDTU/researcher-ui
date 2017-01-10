SOURCES = $(shell find src -name '*.js' -not -regex '.*assets.*')
TARGET = dist/study-gen.js

.PHONY: all
all: $(TARGET)

.PHONY: test
test:
	npm run test

$(TARGET): $(SOURCES)
	npm run build

.PHONY: clean
clean:
	rm -rf dist

.PHONY: run
start: $(TARGET)
	npm run start
