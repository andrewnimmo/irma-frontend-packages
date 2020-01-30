_Work in progress - See https://github.com/privacybydesign/irmajs for now_

# IRMA frontend packages

Welcome to this repository! IRMA frontend packages is a collection of related
packages, that together form a Javascript "client" to the IRMA server. The
primary purpose of these packages is to have a very flexible IRMA client in the
web browser, but you can also use them to build a NodeJS client.

The browser version, by default, will look like this:

![IRMA flow in the browser](docs/images/example.gif)

The client is designed in such a way that you can combine the plugins you need
and configure them in many useful ways. So the above design can easily be
removed (for your NodeJS application) or swapped out for a popup version that is
under way.

## Supported IRMA flows

We support two different IRMA flows, and "tolerate" a third for development and
demo purposes.

As a general best practice, we don't want to allow the web browser to freely
initialize the IRMA flow. Also, in many cases we don't want the result of the
disclosure or signing request to be revealed to the browser. The code that is
running in the web browser could be compromized by the user or third party
injected code.

### Talking to IRMA server through a proxy

The first (and most highly recommended) supported flow that combats these issues
is one where the Javascript client talks to the IRMA server through your own
application back-end, that functions as a proxy.

![Starting a session through a proxy](docs/images/flows/flows.001.png)
_Starting a session through a proxy_

In this flow the IRMA Javascript client requests the back-end for a new session
to be started, and it is the back-end that actually starts the session. In this
flow the web browser can't manipulate the session that gets started or see the
contents of the resulting disclosure:

![Getting the session result through a proxy](docs/images/flows/flows.005.png)
_Getting the session result through a proxy_

<details>
  <summary>How to implement this flow</summary>

  #### Client side

  You can use either the wrapper package [`irma-frontend`](irma-frontend) or
  combine your own packages if you have a build system like webpack.

  ##### `irma-frontend`

  ```html
<script type="text/javascript" src="[link to irma-frontend, see its readme]"></script>

<script type="text/javascript">
  irma.new({
    debugging: false,            // Enable to get helpful output in the browser console
    element:   '#irma-web-form', // Which DOM element to render to

    // Back-end options
    session: {
      // Point this to your controller:
      url: 'https://my-server.domain/irma-endpoint',

      start: {
        url: o => `${o.url}/start`,
        method: 'GET'
      },
      result: {
        url: o => `${o.url}/result`,
        method: 'GET'
      }
    }
  });

  irma.start()
  .then(result => console.log("Successful disclosure! 🎉", result))
  .catch(error => console.error("Couldn't do what you asked 😢", error));
</script>
  ```

  ##### Combining your own packages

  ```bash
$ npm install --save-dev irma-css irma-core irma-web irma-server
  ```

  ```javascript
require('irma-css/dist/irma.css');

const IrmaCore = require('irma-core');
const Web      = require('irma-web');
const Server   = require('irma-server');

const irma = new IrmaCore({
  debugging: false,            // Enable to get helpful output in the browser console
  element:   '#irma-web-form', // Which DOM element to render to

  // Back-end options
  session: {
    // Point this to your controller:
    url: 'https://my-server.domain/irma-endpoint',

    start: {
      url: o => `${o.url}/start`,
      method: 'GET'
    },
    result: {
      url: o => `${o.url}/result`,
      method: 'GET'
    }
  }
});

irma.use(Web);
irma.use(Server);

irma.start()
.then(result => console.log("Successful disclosure! 🎉", result))
.catch(error => console.error("Couldn't do what you asked 😢", error));
  ```

  #### Server side

  Then, on the server side, you have to implement the `start` and `result`
  actions on your `irma-endpoint` controller.

  `start` should make a call to the IRMA server and start the IRMA session
  there. Then, strip the result token from the response JSON and send the rest
  back in the response to the client.

  `results` can fetch the result from the IRMA server using the result token
  that we stripped off the response earlier. Whatever you return to the client
  will be what the Promise on the last few lines resolves to.

  As you saw in the snippets above, you can change the request types and URLs of
  both actions. But you can also change the request body, headers and how to get
  the QR code from the server's response. See the
  [`irma-server`](plugins/irma-server) documentation for details.
</details>

### Talking to IRMA server directly, with signed request

The second supported flow is one where the Javascript client talks to the IRMA
server directly, and is itself responsible for starting the session there.

![Starting a session directly, with signed request](docs/images/flows/flows.002.png)
_Starting a session directly, with signed request_

The payload that gets sent to the IRMA server to start the session is signed by
your application back-end, so the web browser can't alter the request and the
IRMA server can verify its authenticity.

However, the web browser will be able to see the resulting disclosure or signed
contract, because the web browser will be the one receiving the result token
from the IRMA server. This may be an issue for some scenario's.

![Getting the session result directly](docs/images/flows/flows.004.png)
_Getting the session result directly_

<details>
  <summary>How to implement this flow</summary>

  #### Client side

  You can use either the wrapper package [`irma-frontend`](irma-frontend) or
  combine your own packages if you have a build system like webpack.

  ##### `irma-frontend`

  ```html
<script type="text/javascript" src="[link to irma-frontend, see its readme]"></script>

<script type="text/javascript">
  const irmaRequest = 'signed request here';

  irma.new({
    debugging: false,            // Enable to get helpful output in the browser console
    element:   '#irma-web-form', // Which DOM element to render to

    // Back-end options
    session: {
      // Point this to your IRMA server:
      url: 'https://irma-server.my-server.domain/',

      start: {
        body: irmaRequest
      }
    }
  });

  irma.start()
  .then(result => console.log("Successful disclosure! 🎉", result))
  .catch(error => console.error("Couldn't do what you asked 😢", error));
</script>
  ```

  ##### Combining your own packages

  ```bash
$ npm install --save-dev irma-css irma-core irma-web irma-server
  ```

  ```javascript
require('irma-css/dist/irma.css');

const IrmaCore = require('irma-core');
const Web      = require('irma-web');
const Server   = require('irma-server');

const irmaRequest = document.getElementById('irma-request').value;

const irma = new IrmaCore({
  debugging: false,            // Enable to get helpful output in the browser console
  element:   '#irma-web-form', // Which DOM element to render to

  // Back-end options
  session: {
    // Point this to your IRMA server:
    url: 'https://irma-server.my-server.domain/',

    start: {
      body: irmaRequest
    }
  }
});

irma.use(Web);
irma.use(Server);

irma.start()
.then(result => console.log("Successful disclosure! 🎉", result))
.catch(error => console.error("Couldn't do what you asked 😢", error));
  ```

  #### Server side

  On the server side you have to render the signed request in your view, or
  provide some other method of getting the signed request to the client. This is
  left as an exercise for the reader, because there are too many ways in which
  to do it.

  The Promise in the last few lines of the code above will now resolve to the
  result of the disclosure or signing flow. Please note that it is now also up
  to you to transfer this information to your back-end **and also to check that
  the result has been properly signed by your IRMA server** and the browser has
  not altered the results in any way.
</details>

### Talking to IRMA server directly, with plain request

This flow is "tolerated" but not recommended in the browser. It's useful for
making quick demos and for local development, but is probably not a good idea
for production. Unless you're writing a NodeJS client, maybe.

The Javascript client talks directly to the IRMA server and starts an arbitrary
session there. The back-end does not need to be involved at all.

<details>
  <summary>How to implement this flow</summary>

  You can use either the wrapper package [`irma-frontend`](irma-frontend) or
  combine your own packages if you have a build system like webpack.

  ##### `irma-frontend`

  ```html
<script type="text/javascript" src="[link to irma-frontend, see its readme]"></script>

<script type="text/javascript">
  irma.new({
    debugging: false,            // Enable to get helpful output in the browser console
    element:   '#irma-web-form', // Which DOM element to render to

    // Back-end options
    session: {
      // Point this to your IRMA server:
      url: 'https://irma-server.my-server.domain/',

      start: {
        // Define your IRMA request:
        body: JSON.stringify({
          "@context": "https://irma.app/ld/request/disclosure/v2",
          "disclose": [
            [
              [ "pbdf.pbdf.email.email" ]
            ]
          ]
        })
      }
    }
  });

  irma.start()
  .then(result => console.log("Successful disclosure! 🎉", result))
  .catch(error => console.error("Couldn't do what you asked 😢", error));
</script>
  ```

  ##### Combining your own packages

  ```bash
$ npm install --save-dev irma-css irma-core irma-web irma-server
  ```

  ```javascript
require('irma-css/dist/irma.css');

const IrmaCore = require('irma-core');
const Web      = require('irma-web');
const Server   = require('irma-server');

const irma = new IrmaCore({
  debugging: false,            // Enable to get helpful output in the browser console
  element:   '#irma-web-form', // Which DOM element to render to

  // Back-end options
  session: {
    // Point this to your IRMA server:
    url: 'https://irma-server.my-server.domain/',

    start: {
      // Define your IRMA request:
      body: JSON.stringify({
        "@context": "https://irma.app/ld/request/disclosure/v2",
        "disclose": [
          [
            [ "pbdf.pbdf.email.email" ]
          ]
        ]
      })
    }
  }
});

irma.use(Web);
irma.use(Server);

irma.start()
.then(result => console.log("Successful disclosure! 🎉", result))
.catch(error => console.error("Couldn't do what you asked 😢", error));
  ```
</details>

### Skipping the server altogether for development

For development or testing purposes it is often easier to just skip having an
IRMA server at all. You can use the [`irma-dummy`](plugins/irma-dummy) package
to this end.

<details>
  <summary>How to implement this flow</summary>

  ```bash
$ npm install --save-dev irma-css irma-core irma-web irma-dummy
  ```

  ```javascript
require('irma-css/dist/irma.css');

const IrmaCore = require('irma-core');
const Web      = require('irma-web');
const Dummy    = require('irma-dummy');

const irma = new IrmaCore({
  debugging: false,            // Enable to get helpful output in the browser console
  element:   '#irma-web-form', // Which DOM element to render to
  dummy:     'happy path'      // Specify which flow to emulate
});

irma.use(Web);
irma.use(Dummy);

irma.start()
.then(result => console.log("Successful disclosure! 🎉", result))
.catch(error => console.error("Couldn't do what you asked 😢", error));
  ```

  See [`irma-dummy`](plugins/irma-dummy) for more options.
</details>

## Additional documentation

Want to know more about any of the packages? Each package has its own README
file with features, options and purpose of the package:

* [`irma-core`](irma-core)
* [`irma-css`](irma-css)
* [`irma-frontend`](irma-frontend)
* Front-end plugins
  * [`irma-console`](plugins/irma-console)
  * [`irma-popup`](plugins/irma-popup)
  * [`irma-web`](plugins/irma-web)
* Back-end plugins
  * [`irma-dummy`](plugins/irma-dummy)
  * [`irma-server`](plugins/irma-server)

### Examples

Also, we have several examples available that show how you can use specific
combinations of plugins to achieve different effects:

* Web browser
  * [`irma-console`](examples/browser/irma-console)
  * [`irma-frontend`](examples/browser/irma-frontend)
  * [`irma-popup`](examples/browser/irma-popup)
  * [`irma-web`](examples/browser/irma-web)
* Nodejs
  * [`irma-console`](examples/node/irma-console)
* Back-ends
  * [`irma-server`](examples/backends/irma-server)
