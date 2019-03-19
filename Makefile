.PHONY: all start

all:	dir
	@if [ ! -d ./node_modules ]; then npm install; fi
	@npx gulp

dir:
	@mkdir -p dist

start:
	@npm start
