const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const { journies } = require('./journies-results.js');
let journiesConfig = require('./journies-config-results.js').journies;
const { places } = require('./places-results.js');
const { status } = require('./status-results.js');

const { wifiScan } = require('./wifi-scan-results.js');
const { wifiAP } = require('./wifi-ap-results.js');

const syslogConfig = {
    enabled: true,
    ip: '192.168.10.249',
    systems: ['RTOS', 'SDK', 'main', 'RTC', 'SNTP', 'HTTP', 'HTTPD', 'JOURNEY', 'TZDB', 'JSON', 'SH1106', 'WIFI', 'CONF', 'DISP', 'LOG'],
    levels: ['EMERG', 'ALERT', 'CRIT', 'ERROR', 'WARNING', 'NOTICE', 'INFO', 'DEBUG'],
    'system-levels': [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
};

const ledMatrixConfig = {
    levelsLow: [0, 8, 16, 32, 64, 128, 256, 512],
    levelsHigh: [12, 23, 46, 91, 182, 363, 725, 1023],
    override: false,
    overrideLevel: 3,
};

const ledMatrixStatus = {
    level: 4,
    adc: 157,
};

const hostname = '127.0.0.1';
// const hostname = '192.168.10.235';

const port = 8080;

function sendDelayedResponse(response, str, nArg = 0) {
    let n = nArg;
    const totalDelay = 100;
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
        const searchString = query.SearchString.toLowerCase();

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
        }, 0);
    } else {
        const reply = { StatusCode: -1, Message: `This API does not support request method ${request.method}` };
        const jsonString = JSON.stringify(reply);
        response.writeHead(405, { 'Content-Type': 'text/json', Allow: 'GET', 'Content-Length': Buffer.byteLength(jsonString) });
        response.write(jsonString);
        response.end();
    }
}

function handleStatus(request, response) {
    if (request.method === 'GET') {
        const jsonString = JSON.stringify(status);
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

let wifiConnected = 0;

setInterval(() => {
    if (wifiConnected < wifiAP.length) {
        wifiAP[wifiConnected].status = '';
    }
    wifiConnected = (wifiConnected + 1) % wifiAP.length;
    wifiAP[wifiConnected].status = 'connecting';
}, 3000);


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

            setTimeout(() => {
                response.writeHead(204);
                response.end();
            }, 500);

            setTimeout(() => {
                wifiAP[0].status = 'connecting';
            }, 1000);
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

function handleLog(request, response) {
    if (request.method === 'GET') {
        const jsonString = '[{"timestamp":0,"level":6,"system":2,"message":"SDK version:2.0.0(e271380)"},{"timestamp":0,"level":6,"system":11,"message":"Starting WiFi"},{"timestamp":0,"level":6,"system":11,"message":"WIFI_STATE_NOT_CONNECTED: trying to connect to TN_24GHz_62FAE1"},{"timestamp":0,"level":6,"system":8,"message":"Starting TimeZoneDB task"},{"timestamp":0,"level":6,"system":7,"message":"Journey task starting"},{"timestamp":0,"level":6,"system":5,"message":"Listening on port 80"},{"timestamp":0,"level":6,"system":11,"message":"WIFI_STATE_AP_CONNECTING: connected"},{"timestamp":0,"level":6,"system":4,"message":"Stratum: 2"},{"timestamp":0,"level":6,"system":4,"message":"Got timestamp 1538337939"},{"timestamp":0,"level":6,"system":4,"message":"Adjust: drift = -1419444362 ticks, cal = 26147"},{"timestamp":1538337939,"level":6,"system":8,"message":"Updating timezone"},{"timestamp":1538337939,"level":6,"system":5,"message":"DNS lookup for api.timezonedb.com succeeded. IP=167.114.201.132"},{"timestamp":1538337939,"level":6,"system":8,"message":"Parsing TZDB json"},{"timestamp":1538337939,"level":6,"system":8,"message":"Country: Sweden"},{"timestamp":1538337939,"level":6,"system":8,"message":"Zone name: Europe/Stockholm"},{"timestamp":1538337939,"level":6,"system":8,"message":"Offset: 7200"},{"timestamp":1538337939,"level":6,"system":8,"message":"DST: yes"},{"timestamp":1538337939,"level":6,"system":8,"message":"Timezone change at 2018-10-28 00:59:59"},{"timestamp":1538337939,"level":6,"system":8,"message":"New timezone: CEST-2"},{"timestamp":1538337939,"level":6,"system":8,"message":"Next update at 2018-10-01 22:05:39"},{"timestamp":1538337940,"level":6,"system":7,"message":"Updating journey 0"},{"timestamp":1538337940,"level":6,"system":5,"message":"DNS lookup for api.sl.se succeeded. IP=194.68.78.66"},{"timestamp":1538337941,"level":6,"system":7,"message":"Journey from with line 80 from Saltsjöqvarn to Nybroplan:"},{"timestamp":1538337941,"level":6,"system":7,"message":"Next update at 2018-09-30 22:35:40"},{"timestamp":1538337941,"level":6,"system":7,"message":"Updating journey 1"},{"timestamp":1538337941,"level":6,"system":5,"message":"DNS lookup for api.sl.se succeeded. IP=194.68.78.66"},{"timestamp":1538337941,"level":6,"system":7,"message":"Mode: BUS"},{"timestamp":1538337941,"level":6,"system":7,"message":"Number: 53"},{"timestamp":1538337941,"level":6,"system":7,"message":"Destination: Karolinska institutet"},{"timestamp":1538337941,"level":6,"system":7,"message":"Direction: 2"},{"timestamp":1538337941,"level":6,"system":7,"message":"Stop: Henriksdalsberget"},{"timestamp":1538337941,"level":6,"system":7,"message":"Raw time: 2018 - 09 - 30T22: 27: 00"},{"timestamp":1538337941,"level":6,"system":7,"message":"Time: 2018-09-30 22:27:00 (1538339220)"},{"timestamp":1538337941,"level":6,"system":7,"message":"Match #1"},{"timestamp":1538337941,"level":6,"system":7,"message":"Mode: BUS"},{"timestamp":1538337941,"level":6,"system":7,"message":"Number: 53"},{"timestamp":1538337941,"level":6,"system":7,"message":"Destination: Karolinska institutet"},{"timestamp":1538337941,"level":6,"system":7,"message":"Direction: 2"},{"timestamp":1538337941,"level":6,"system":7,"message":"Stop: Henriksdalsberget"},{"timestamp":1538337941,"level":6,"system":7,"message":"Raw time: 2018 - 09 - 30T22: 57: 00"},{"timestamp":1538337941,"level":6,"system":7,"message":"Time: 2018-09-30 22:57:00 (1538341020)"},{"timestamp":1538337941,"level":6,"system":7,"message":"Match #2"},{"timestamp":1538337941,"level":6,"system":7,"message":"Journey from with line 53 from Henriksdalsberget to Karolinska institutet:"},{"timestamp":1538337941,"level":6,"system":7,"message":"Depature 0 at 2018-09-30 22:27:00"},{"timestamp":1538337941,"level":6,"system":7,"message":"Depature 1 at 2018-09-30 22:57:00"},{"timestamp":1538337941,"level":6,"system":7,"message":"Next update at 2018-09-30 22:35:41"},{"timestamp":1538337948,"level":6,"system":5,"message":"Connection 1 from 192.168.10.235:44258"},{"timestamp":1538337948,"level":6,"system":5,"message":"Connection 2 from 192.168.10.235:44770"}]';
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

function handleSyslogConfig(request, response, body) {
    if (request.method === 'GET') {
        const jsonString = JSON.stringify(syslogConfig);

        response.writeHead(200, { 'Content-Type': 'text/json', 'Content-Length': Buffer.byteLength(jsonString) });
        sendDelayedResponse(response, jsonString);
    } else if (request.method === 'POST') {
        const newConfig = JSON.parse(body);

        if (newConfig.ip) {
            syslogConfig.ip = newConfig.ip;
        }
        syslogConfig.enabled = newConfig.enabled;
        syslogConfig['system-levels'] = newConfig['system-levels'];

        response.writeHead(204);
        response.end();
    } else {
        const reply = { StatusCode: -1, Message: `This API does not support request method ${request.method}` };
        const jsonString = JSON.stringify(reply);
        response.writeHead(405, { 'Content-Type': 'text/json', Allow: 'GET', 'Content-Length': Buffer.byteLength(jsonString) });
        response.write(jsonString);
        response.end();
    }
}

function handleLedMatrixConfig(request, response, body) {
    if (request.method === 'GET') {
        const jsonString = JSON.stringify(ledMatrixConfig);

        response.writeHead(200, { 'Content-Type': 'text/json', 'Content-Length': Buffer.byteLength(jsonString) });
        sendDelayedResponse(response, jsonString);
    } else if (request.method === 'POST') {
        const newConfig = JSON.parse(body);

        ledMatrixConfig.levelsHigh = newConfig.levelsHigh;
        ledMatrixConfig.levelsLow = newConfig.levelsLow;
        ledMatrixConfig.override = newConfig.override;
        ledMatrixConfig.overrideLevel = newConfig.overrideLevel;

        response.writeHead(204);
        response.end();
    } else {
        const reply = { StatusCode: -1, Message: `This API does not support request method ${request.method}` };
        const jsonString = JSON.stringify(reply);
        response.writeHead(405, { 'Content-Type': 'text/json', Allow: 'GET', 'Content-Length': Buffer.byteLength(jsonString) });
        response.write(jsonString);
        response.end();
    }
}

function handleLedMatrixStatus(request, response) {
    if (request.method === 'GET') {
        ledMatrixStatus.adc += Math.floor(Math.random() * 4) - 2;
        ledMatrixStatus.adc = Math.max(ledMatrixStatus.adc, 0);
        ledMatrixStatus.adc = Math.min(ledMatrixStatus.adc, 1023);

        if (ledMatrixConfig.override) {
            ledMatrixStatus.level = ledMatrixConfig.overrideLevel;
        } else {
            if (ledMatrixStatus.adc > ledMatrixConfig.levelsHigh[ledMatrixStatus.level]) {
                ledMatrixStatus.level = Math.min(7, ledMatrixStatus.level + 1);
            }
            if (ledMatrixStatus.adc < ledMatrixConfig.levelsLow[ledMatrixStatus.level]) {
                ledMatrixStatus.level = Math.max(0, ledMatrixStatus.level - 1);
            }
        }

        const jsonString = JSON.stringify(ledMatrixStatus);

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

const server = http.createServer((request, response) => {
    let body = [];
    request.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();

        const { pathname } = url.parse(request.url, true);

        const knownPaths = {
            '/api/wifi-status.json': handleWifiStatus,
            '/api/wifi-scan.json': handleWifiScan,
            '/api/wifi-list.json': handleWifiList,
            '/api/journies-config.json': handleJourniesConfig,
            '/api/journies.json': handleJournies,
            '/api/places.json': handlePlaces,
            '/api/status.json': handleStatus,
            '/api/log.json': handleLog,
            '/api/syslog-config.json': handleSyslogConfig,
            '/api/led-matrix-config.json': handleLedMatrixConfig,
            '/api/led-matrix-status.json': handleLedMatrixStatus,
        };

        if (knownPaths[pathname]) {
            knownPaths[pathname](request, response, body);
        } else {
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
    });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
