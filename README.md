# talebay

talebay is only a first prototype.

![](https://t4l3.net/screenshot.png)

`talebay` is a fork of the [patchbay](https://github.com/ssbc/patchbay), an (secure-scuttlebutt](https://scuttlebot.io) client interface.



## Running

First I have to ask you to install `sbot`, which distributes the database content with your friends and makes it available to client programs, like `talebay`. (All this is based on [nodejs](https://nodejs.org), so install that if you havn't already.)

```
# install sbot
$ npm install scuttlebot@latest -g
$ sbot server

# then in another terminal window (these must be 3 separate commands)
# install the plugins talebay needs
$ sbot plugins.install ssb-links
$ sbot plugins.install ssb-query
$ sbot plugins.install ssb-ws

# restart sbot server (go back to previous tab and kill it by closing the window or pressing ctrl+c)


# now clone and run patchbay.

$ git clone http://git.scuttlebot.io/%25nrVrnO5An0BWMGK7yo1t%2Ft7YSSdNR8KKagWSaPYPbak%3D.sha256 talebay
$ cd talebay
$ npm install
$ npm run rebuild
$ npm start
```

## Lite (web/non-electron)

To run a lite client in the browser instead of using electron, use npm run lite from the prompt instead of run bundle. After that you need to generate a modern invite:

```
sbot invite.create --modern
```

Also set up sbot to allow these connections with:

```
sbot server --allowPrivate
```

Lastly open build/index.html in a browser and append the invite
created above using: `index.html#ws://localhost:8989....`

## License

MIT
