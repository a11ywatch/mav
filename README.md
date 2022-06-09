# Mav

[![A11yWatch](https://circleci.com/gh/A11yWatch/mav.svg?style=svg)](https://circleci.com/gh/A11yWatch/mav)[![Maintainability](https://api.codeclimate.com/v1/badges/72068a1ff5c0f5248432/maintainability)](https://codeclimate.com/github/A11yWatch/mav/maintainability)[![codecov](https://codecov.io/gh/A11yWatch/mav/branch/master/graph/badge.svg?token=MBV2LGQO3J)](https://codecov.io/gh/A11yWatch/mav)

A gRPC image recognition service that uses Tensorflow and Computer Vision.

## Local

When running locally on a mac make sure to run `brew install pkg-config cairo pango libpng jpeg giflib librsvg` in order for canvas to have the correct native deps.

## Start

```sh
yarn
yarn dev
# or
docker compose up
```

The server will run on port 8080.

### Usage

View the [proto](./src/proto/mav.proto) file to get started.

## Computer Vision

In order to use computer vision from azure you need to add the following env keys `COMPUTER_VISION_SUBSCRIPTION_KEY` and `COMPUTER_VISION_ENDPOINT`.
This repo is setup to use a collection of services to determine what an alt tag may be.

## LICENSE

check the license file in the root of the project.
