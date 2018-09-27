const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const { journies } = require('./journies-results.js');
let journiesConfig = require('./journies-config-results.js').journies;
const { places } = require('./places-results.js');


const { wifiScan } = require('./wifi-scan-results.js');
const { wifiAP } = require('./wifi-ap-results.js');


const hostname = '127.0.0.1';
const port = 8080;

function sendDelayedResponse(response, str, nArg = 0) {
    let n = nArg;
    const totalDelay = 500;
    const steps = 10;
    setTimeout(() => {
        const m = Math.round(str.length / steps);
        response.write(str.substring(n, n + m));
        n += m;
        if (n >= str.length) {
            response.end();
        } else {
            sendDelayedResponse(response, str, n);
        }
    }, totalDelay / steps);
}

function handleJournies(request, response) {
    if (request.method === 'GET') {
        const { query } = url.parse(request.url, true);
        const { siteId } = query;

        let reply;

        if (!siteId) {
            reply = { StatusCode: -1, Message: 'No siteId!' };
        } else {
            const journey = journies[siteId];
            if (!journey) {
                reply = { StatusCode: -1, Message: `siteId ${siteId} not found` };
            } else {
                reply = journies[siteId];
            }
        }

        const jsonString = JSON.stringify(reply);

        console.log(jsonString);
        console.log(Buffer.byteLength(jsonString));

        response.writeHead(200, { 'Content-Type': 'text/json', 'Content-Length': Buffer.byteLength(jsonString) });

        sendDelayedResponse(response, jsonString);
    } else {
        const reply = { StatusCode: -1, Message: `This API does not support request method ${request.method}` };
        const jsonString = JSON.stringify(reply);
        response.writeHead(405, { 'Content-Type': 'text/json', Allow: 'GET', 'Content-Length': Buffer.byteLength(jsonString) });
        response.write(jsonString);
        response.end();
    }
}

function handleJourniesConfig(request, response, body) {
    if (request.method === 'GET') {
        const reply = journiesConfig;
        const jsonString = JSON.stringify(reply);

        response.writeHead(200, { 'Content-Type': 'text/json' });

        sendDelayedResponse(response, jsonString);
    } else if (request.method === 'POST') {
        try {
            const newConfig = JSON.parse(body);
            console.log(newConfig);

            if (newConfig.length <= 2) {
                journiesConfig = newConfig;

                response.writeHead(204);
                response.end();
            } else {
                response.writeHead(400);
                response.end();
            }
        } catch (err) {
            console.log('error');
            console.log(err);

            response.writeHead(400);
            response.end();
        }
    } else {
        const reply = { StatusCode: -1, Message: `This API does not support request method ${request.method}` };
        const jsonString = JSON.stringify(reply);
        response.writeHead(405, { 'Content-Type': 'text/json', Allow: 'GET', 'Content-Length': Buffer.byteLength(jsonString) });
        response.write(jsonString);
        response.end();
    }
}

function handlePlaces(request, response) {
    if (request.method === 'GET') {
        const { query } = url.parse(request.url, true);
        const searchString = query.SearchString;

        let reply = {
            StatusCode: 1008,
            Message: 'Proxy error',
        };

        if (searchString && searchString.length >= 4 && places[searchString.substring(0, 4)]) {
            reply = places[searchString.substring(0, 4)];
        }

        const jsonString = JSON.stringify(reply);

        response.writeHead(200, { 'Content-Type': 'text/json' });
        sendDelayedResponse(response, jsonString);
    } else {
        const reply = { StatusCode: -1, Message: `This API does not support request method ${request.method}` };
        const jsonString = JSON.stringify(reply);
        response.writeHead(405, { 'Content-Type': 'text/json', Allow: 'GET', 'Content-Length': Buffer.byteLength(jsonString) });
        response.write(jsonString);
        response.end();
    }
}

function handleWifiScan(request, response) {
    if (request.method === 'GET') {
        for (const ap of wifiScan) {
            ap.rssi += Math.round(10 * Math.random() - 5);
            if (ap.rssi < -127) {
                ap.rssi = -127;
            }
        }

        const jsonString = JSON.stringify(wifiScan);
        response.writeHead(200, { 'Content-Type': 'text/json' });

        setTimeout(() => {
            sendDelayedResponse(response, jsonString);
        }, 3000);
    } else {
        const reply = { StatusCode: -1, Message: `This API does not support request method ${request.method}` };
        const jsonString = JSON.stringify(reply);
        response.writeHead(405, { 'Content-Type': 'text/json', Allow: 'GET', 'Content-Length': Buffer.byteLength(jsonString) });
        response.write(jsonString);
        response.end();
    }
}

function handleWifiStatus(request, response) {
    if (request.method === 'GET') {
        const n = Math.floor(Math.random() * 256);

        let reply;

        if (wifiAP.find(a => a.status === 'connected')) {
            const ap = wifiAP.find(a => a.status === 'connected');
            reply = {
                mode: 'station',
                station: {
                    status: 'connected',
                    ssid: ap.ssid,
                    ip: `192.168.${n}.${Math.floor(1 + Math.random() * 255)}`,
                    netmask: '255.255.0.0',
                    gateway: `192.168.${n}.1`,
                },
                softAP: {
                },
            };
        } else if (wifiAP.find(a => a.status === 'connecting')) {
            const ap = wifiAP.find(a => a.status === 'connecting');
            reply = {
                mode: 'station',
                station: {
                    status: 'connecting',
                    ssid: ap.ssid,
                    ip: '',
                    netmask: '',
                    gateway: '',
                },
                softAP: {
                },
            };
        } else {
            reply = {
                mode: 'station',
                station: {
                    status: 'not connected',
                    ssid: '',
                    ip: '',
                    netmask: '',
                    gateway: '',
                },
                softAP: {
                },
            };
        }
        const jsonString = JSON.stringify(reply);
        response.writeHead(200, { 'Content-Type': 'text/json', 'Content-Length': Buffer.byteLength(jsonString) });
        sendDelayedResponse(response, jsonString);
    } else {
        const reply = { StatusCode: -1, Message: `This API does not support request method ${request.method}` };
        const jsonString = JSON.stringify(reply);
        response.writeHead(405, { 'Content-Type': 'text/json', Allow: 'GET', 'Content-Length': Buffer.byteLength(jsonString) });
        response.write(jsonString);
        response.end();
    }
}


function handleWifiList(request, response, body) {
    if (request.method === 'GET') {
        const jsonString = JSON.stringify(wifiAP);
        response.writeHead(200, { 'Content-Type': 'text/json', 'Content-Length': Buffer.byteLength(jsonString) });
        sendDelayedResponse(response, jsonString);
    } else if (request.method === 'POST') {
        for (const a of wifiAP) {
            a.status = '';
        }

        const newAP = JSON.parse(body);

        const a = wifiAP.find(b => b.ssid === newAP.ssid);

        if (newAP.password) {
            console.log(`Connecting to ${newAP.ssid} with password ${newAP.password}`);
        } else {
            console.log(`Connecting to ${newAP.ssid} with no password`);
        }

        if (a) {
            a.saved = true;
            a.status = 'connecting';
            setTimeout(() => {
                if (Math.random() < 0.75) {
                    a.status = 'connected';
                    console.log(`Connected to ${a.ssid}`);
                } else {
                    a.status = '';
                    console.log(`Connection to ${a.ssid} failed`);
                }
            }, 3000);
        } else {
            newAP.saved = true;
            newAP.status = 'connecting';
            wifiAP.push(newAP);
            setTimeout(() => {
                newAP.status = 'connected';
                console.log(`Connected to ${newAP.ssid}`);
            }, 5000);
        }

        const jsonString = JSON.stringify(wifiAP);
        response.writeHead(200, { 'Content-Type': 'text/json', 'Content-Length': Buffer.byteLength(jsonString) });
        sendDelayedResponse(response, jsonString);
    } else if (request.method === 'DELETE') {
        const affectedAP = JSON.parse(body);
        const index = wifiAP.findIndex(a => a.ssid === affectedAP.ssid);

        if (index >= 0) {
            wifiAP.splice(index, 1);
            console.log(`Deleted ${affectedAP.ssid}`);

            response.writeHead(204);
            response.end();
        } else {
            const reply = { StatusCode: -1, Message: `AP ${affectedAP.ssid} not found` };
            const jsonString = JSON.stringify(reply);
            response.writeHead(404, { 'Content-Type': 'text/json', Allow: 'GET', 'Content-Length': Buffer.byteLength(jsonString) });
            response.write(jsonString);
            response.end();
        }
    } else {
        const reply = { StatusCode: -1, Message: `This API does not support request method ${request.method}` };
        const jsonString = JSON.stringify(reply);
        response.writeHead(405, { 'Content-Type': 'text/json', Allow: 'GET', 'Content-Length': Buffer.byteLength(jsonString) });
        response.write(jsonString);
        response.end();
    }
}

const server = http.createServer((request, response) => {
    let body = [];
    request.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();

        const { pathname } = url.parse(request.url, true);

        switch (pathname) {
        case '/api/wifi-status.json':
            handleWifiStatus(request, response, body);
            break;

        case '/api/wifi-scan.json':
            handleWifiScan(request, response, body);
            break;

        case '/api/wifi-list.json':
        case '/api/wifi-ap.json':

            handleWifiList(request, response, body);
            break;

        case '/api/journies-config.json':
            handleJourniesConfig(request, response, body);
            break;

        case '/api/journies.json':
            handleJournies(request, response, body);
            break;

        case '/api/places.json':
            handlePlaces(request, response, body);
            break;

        default:
            {
                let filename = `./src${pathname}`;

                const mimeMap = {
                    '.ico': 'image/x-icon',
                    '.html': 'text/html',
                    '.js': 'text/javascript',
                    '.json': 'application/json',
                    '.css': 'text/css',
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.wav': 'audio/wav',
                    '.mp3': 'audio/mpeg',
                    '.svg': 'image/svg+xml',
                    '.pdf': 'application/pdf',
                    '.doc': 'application/msword',
                };

                fs.exists(filename, (exists) => {
                    if (!exists) {
                        response.writeHead(404, { 'Content-Type': 'text/plain' });
                        response.write(`URL "${pathname}" not found`);
                        response.end();
                    } else {
                        if (fs.statSync(filename).isDirectory()) filename += '/index.html';

                        const { ext } = path.parse(filename);

                        fs.readFile(filename, (err, data) => {
                            if (err) {
                                response.writeHead(500, { 'Content-Type': 'text/plain' });
                                response.end(`Error opening ${pathname}: ${err}`);
                            } else {
                                response.writeHead(200, { 'Content-Type': mimeMap[ext] || 'text/plain' });
                                response.end(data);
                            }
                        });
                    }
                });
            }
            break;
        }
    });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
