# Mav

[![A11yWatch](https://circleci.com/gh/A11yWatch/mav.svg?style=svg)](https://circleci.com/gh/A11yWatch/mav)[![Maintainability](https://api.codeclimate.com/v1/badges/72068a1ff5c0f5248432/maintainability)](https://codeclimate.com/github/A11yWatch/mav/maintainability)[![codecov](https://codecov.io/gh/A11yWatch/mav/branch/master/graph/badge.svg?token=MBV2LGQO3J)](https://codecov.io/gh/A11yWatch/mav)

AI and machine learning to declare alts, spacing, and more. Checkout [docs](https://a11ywatch.github.io/docs/documentation/mav)

## Docker

if using this service in a docker env make sure to create a .env file and add the env var DOCKER_ENV=true

## M1

If your on an m1 you need to run `brew install pkg-config cairo pango libpng jpeg giflib librsvg` in order for canvas to have the correct libs.

## Installation

```
npm install
```

## Start

```
yarn dev
```

The server will run on port 8080.

### Usage

Rest endpoints 

POST:
`/api/parseImg`
body: {img: Buffer}

## LICENSE

check the license file in the root of the project.
