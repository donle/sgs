# SGS (三国杀)

## Getting Started

1. Clone this repo:

```sh
$ git clone git@github.com:donle/sgs.git <working_directory>
```

2. Install dependencies:

```sh
$ cd <working_directory>
# cnpm is recommended if you're in China.
$ npm install
$ cd src/server
$ npm install
$ cd ../ui/platforms/desktop
$ npm install
```

3. Running. You need to start the server and client respectively.
```sh
# cwd is <working_directory>
# Start server
$ cd src/server
$ npm run dev #dev:win if you're using Windows.
# Start client
$ cd ./ui/platforms/desktop
$ npm run start:mac #start:win if you're using Windows.
```

## Test with electron environment

1. Running electron in the frontend root directoy
```sh
$ cd [<work_directory>]/src/ui/platforms/desktop
```

2. Launch dev web for electron
```sh
$ yarn electron-dev:mac #electron-dev:win if you'r using Windows
```

3. Lunch electron locally with embedded dev web
```sh
$ yarn electron:mac #electron:win if you're using Windows
```

## Configuration

You may configure how the clients and server execute and communicate.

edit `src/server/server_config.ts` to configure the server
edit `src/ui/platforms/desktop/src/client.config.ts` to configure the web client
