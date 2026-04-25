VERSION:=$(shell ./getVersion.sh)

.PHONY: version

fmt:
	black src/homed.py

build:
	@echo "Building image" && \
	docker build -t mwalters/homed-hub:1.5.0-prerelease -t mwalters/homed-hub:latest .

stop:
	docker stop homed; true

run: stop build
	docker run --rm -d --name homed -e ENV=development -p 5050:5000 -v /Users/mwalters/tmp/test:/config mwalters/homed:$(VERSION) && \
	docker logs -f homed

push-prerelease:
	docker buildx build --push --platform linux/arm/v7,linux/arm64/v8,linux/amd64 -t mwalters/homed:$(VERSION) .

push:
	docker buildx build --push --platform linux/arm/v7,linux/arm64/v8,linux/amd64 -t mwalters/homed:latest -t mwalters/homed:$(VERSION) .

version:
	@echo Version: $(VERSION)
