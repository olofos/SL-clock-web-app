function makeHTTPRequest(method, url, body, progressHandler) {
    return new Promise((resolve, reject) => {
        const xhttp = new XMLHttpRequest();

        xhttp.open(method, url);

        xhttp.onload = function onload(ev) {
            if (progressHandler) {
                progressHandler.onprogress(ev);
                progressHandler.stop();
            }

            if (this.status >= 200 && this.status < 300) {
                resolve(xhttp.responseText);
            } else {
                reject(new Error(`${this.status}: ${this.statusText}`));
            }
        };

        xhttp.onerror = function onerror(ev) {
            if (progressHandler) {
                progressHandler.onprogress(ev);
                progressHandler.stop();
            }
            reject(new Error('An error occured during HTTP request'));
        };

        if (progressHandler) {
            xhttp.onprogress = ev => progressHandler.onprogress(ev);

            progressHandler.start();
        }

        xhttp.send(body);
    });
}

class SpinnerProgressHandler {
    constructor(panel) {
        this.panel = panel;
        this.spinner = this.panel.querySelector('.header .spinner');
        this.spinner.addEventListener('transitionend', () => {
            if (this.panel.classList.contains('done')) {
                this.panel.classList.remove('loading', 'done');
            }
        });
    }

    start() {
        this.panel.classList.remove('done');
        this.panel.classList.add('loading');
    }

    stop() {
        this.panel.classList.add('done');
    }

    onprogress() { } // eslint-disable-line class-methods-use-this
}

function getTemplate(name) {
    const id = `template-${name}`;
    return Array.from(document.getElementById(id).content.children);
}

function cloneTemplate(name) {
    const nodes = getTemplate(name);
    return nodes[0].cloneNode(true);
}

function cloneIcon(name) {
    const icons = document.getElementById('template-icons').content;
    const icon = icons.querySelector(`.icon-${name}`);

    if (icon) {
        return icon.cloneNode(true);
    }
    return null;
}

function cloneJourneyIcon(mode) {
    const iconNames = {
        1: 'bus',
        2: 'metro',
        3: 'train',
        4: 'tram',
        5: 'ship',
    };

    if (iconNames[mode]) {
        return cloneIcon(iconNames[mode]);
    }
    return null;
}

function createJourneyNode(journey) {
    const elem = cloneTemplate('journey');

    elem.querySelector('.line').innerText = journey.line;
    elem.querySelector('.stop').innerText = journey.stop;
    elem.querySelector('.destination').innerText = journey.destination;

    const icon = cloneJourneyIcon(journey.mode);
    if (icon) {
        elem.querySelector('.icon').append(icon);
    }

    elem.dataset.journey = JSON.stringify(journey);

    return elem;
}

function removeChildren(elem) {
    Array.from(elem.children).forEach(child => child.remove());
}

class JourneyConfigEditorJourneySelect {
    constructor(panel, siteId) {
        this.panel = panel;
        this.siteId = siteId;
        this.container = panel.querySelector('.journies-container.journey-select');
        this.container.classList.remove('not-found');
    }

    back() {
        this.tearDown();
        this.onDone(null);
    }

    ok() {
        const selected = this.journeyList.querySelector('.selected');
        const journey = JSON.parse(selected.dataset.journey);

        this.tearDown();
        this.onDone(journey);
    }

    rigBackOkButtons() {
        const drawer = this.container.querySelector('.buttons-drawer');
        const buttonOK = drawer.querySelector('.ok');
        const buttonBack = drawer.querySelector('.back');

        buttonOK.addEventListener('click', () => this.ok());
        buttonBack.addEventListener('click', () => this.back());
    }

    rigJourney(elem) {
        elem.addEventListener('click', () => {
            if (!elem.classList.contains('selected')) {
                const oldSelected = this.journeyList.querySelector('.selected');
                if (oldSelected) {
                    oldSelected.classList.remove('selected');
                }

                elem.classList.add('selected');

                this.container.querySelector('button.ok').disabled = false;
            }
        });
    }

    static normaliseJourney(journey) {
        const normalised = {};

        normalised.line = journey.LineNumber;
        normalised.stop = journey.StopAreaName;
        normalised.destination = journey.Destination;
        normalised.direction = journey.JourneyDirection;

        const modes = {
            BUS: 1,
            METRO: 2,
            TRAIN: 3,
            TRAM: 4,
            SHIP: 5,
        };

        normalised.mode = modes[journey.TransportMode];

        return normalised;
    }

    static compareJournies(a, b) {
        if (a.stop < b.stop) return -1;
        if (a.stop > b.stop) return +1;
        if (parseInt(a.line, 10) < parseInt(b.line, 10)) return -1;
        if (parseInt(a.line, 10) > parseInt(b.line, 10)) return +1;
        if (a.line < b.line) return -1;
        if (a.line > b.line) return +1;
        if (a.destination < b.destination) return -1;
        if (a.destination > b.destination) return +1;
        if (a.siteId < b.siteId) return -1;
        if (a.siteId > b.siteId) return +1;
        if (a.mode < b.mode) return -1;
        if (a.mode > b.mode) return +1;
        return 0;
    }

    formatJourney(journey) {
        const elem = createJourneyNode(journey);
        this.rigJourney(elem);

        this.journeyList.append(elem);
    }

    addSiteId(journey) {
        journey['site-id'] = Number(this.siteId);
        return journey;
    }

    getJourney(onDone) {
        this.onDone = onDone;

        this.panel.classList.add('journey-select');
        const nodes = getTemplate('journey-journey-select');
        nodes.forEach(node => this.container.append(node.cloneNode(true)));

        this.journeyList = this.container.querySelector('.journey-list');

        this.spinner = new SpinnerProgressHandler(this.panel);

        this.rigBackOkButtons();

        makeHTTPRequest('GET', `/api/journies.json?siteId=${this.siteId}`, null, this.spinner)
            .then(JSON.parse)
            .then(result => result.ResponseData)
            .then(result => [].concat(
                result.Buses,
                result.Metros,
                result.Trains,
                result.Trams,
                result.Ships,
            ))
            .then(result => result.map(JourneyConfigEditorJourneySelect.normaliseJourney))
            .then(result => result.map(journey => this.addSiteId(journey)))
            .then(result => result.sort(JourneyConfigEditorJourneySelect.compareJournies))
            .then(result => result.filter((item, pos) => {
                if (pos === 0) return true;
                return JourneyConfigEditorJourneySelect.compareJournies(
                    result[pos - 1],
                    item,
                ) !== 0;
            }))
            .then(result => result.forEach(journey => this.formatJourney(journey)))
            .catch((err) => {
                console.log(err);
                this.container.classList.add('not-found');
            });
    }

    tearDown() {
        this.panel.classList.remove('journey-select');
        removeChildren(this.container);
    }
}

class JourneyConfigEditorSiteSelect {
    constructor(panel) {
        this.panel = panel;
        this.container = panel.querySelector('.journies-container.site-select');
        this.spinner = new SpinnerProgressHandler(this.panel);
    }

    next() {
        const selected = this.siteList.querySelector('.selected');
        const journeySelect = new JourneyConfigEditorJourneySelect(this.panel,
            selected.dataset.SiteId);

        this.panel.classList.remove('site-select');

        journeySelect.getJourney((journey) => {
            if (journey) {
                this.tearDown();
                this.onDone(journey);
            } else {
                this.panel.classList.add('site-select');
            }
        });
    }

    cancel() {
        this.tearDown();
        this.onDone(null);
    }

    rigSiteButtons(elem) {
        elem.addEventListener('click', () => {
            if (!elem.classList.contains('selected')) {
                const oldSelected = this.siteList.querySelector('.selected');
                if (oldSelected) {
                    oldSelected.classList.remove('selected');
                }

                elem.classList.add('selected');
                this.container.querySelector('button.next').disabled = false;
            }
        });
    }

    formatPlaces(sites) {
        removeChildren(this.siteList);

        sites.forEach((place) => {
            const elem = cloneTemplate('site');
            elem.querySelector('.name').innerText = place.Name;
            elem.dataset.SiteId = place.SiteId;
            this.siteList.append(elem);

            this.rigSiteButtons(elem);
        });
    }

    doSearch() {
        const { value } = this.searchField;

        if (value.length > 2) {
            makeHTTPRequest('GET', `/api/places.json?SearchString=${value}`, null, this.spinner)
                .then(JSON.parse)
                .then(r => r.ResponseData)
                .then((result) => {
                    if (result) {
                        this.formatPlaces(result);
                    }
                });
        }
    }

    rigSearchBar() {
        const searchBar = this.container.querySelector('.search-bar');
        const buttonSearch = searchBar.querySelector('button');
        this.searchField = searchBar.querySelector('input');

        buttonSearch.addEventListener('click', () => this.doSearch());
        this.searchField.addEventListener('change', () => this.doSearch());
        this.searchField.addEventListener('input', () => {
            buttonSearch.disabled = this.searchField.value.length < 3;
        });
    }

    rigNextCancelButtons() {
        const drawer = this.container.querySelector('.buttons-drawer');
        const buttonNext = drawer.querySelector('.next');
        const buttonCancel = drawer.querySelector('.cancel');

        buttonNext.addEventListener('click', () => this.next());
        buttonCancel.addEventListener('click', () => this.cancel());
    }

    getJourney(onDone) {
        this.onDone = onDone;

        this.panel.classList.add('site-select');
        const nodes = getTemplate('journey-site-select');
        nodes.forEach(node => this.container.append(node.cloneNode(true)));

        this.siteList = this.container.querySelector('.site-list');
        this.rigSearchBar();
        this.rigNextCancelButtons();
    }

    tearDown() {
        this.panel.classList.remove('site-select');
        removeChildren(this.container);
    }
}

class JourneyConfigPanel {
    constructor() {
        this.panel = document.getElementById('tab-panel-configure-journies');
        this.container = this.panel.querySelector('.journies-container.config');
        this.journeyList = this.container.querySelector('.journey-list');

        this.spinner = new SpinnerProgressHandler(this.panel);

        this.panel.querySelector('.buttons-drawer .save').addEventListener('click', () => this.save());
        this.panel.querySelector('.buttons-drawer .reset').addEventListener('click', () => this.reset());
    }

    activate() {
        if (this.journeyList.children.length === 0) {
            this.loadJourniesConfig();
        }
    }

    reset() {
        this.noChanges();
        this.loadJourniesConfig();
    }

    save() {
        const journiesString = Array.from(this.journeyList.querySelectorAll('.journey'))
            .map(elem => elem.dataset.journey).join(',');
        const body = `[${journiesString}]`;

        makeHTTPRequest('POST', '/api/journies-config.json', body, this.spinner)
            .then(() => this.noChanges());
    }

    noChanges() {
        const buttonSave = this.panel.querySelector('.buttons-drawer .save');
        const buttonReset = this.panel.querySelector('.buttons-drawer .reset');

        buttonSave.disabled = true;
        buttonReset.disabled = true;

        this.panel.classList.remove('unsaved');
    }

    hasChanged() {
        const buttonSave = this.panel.querySelector('.buttons-drawer .save');
        const buttonReset = this.panel.querySelector('.buttons-drawer .reset');

        buttonSave.disabled = false;
        buttonReset.disabled = false;

        this.panel.classList.add('unsaved');
    }

    addJourney() {
        if (this.journeyList.children.length < 3) {
            const editor = new JourneyConfigEditorSiteSelect(this.panel);
            editor.getJourney((journey) => {
                if (journey) {
                    const addNode = this.journeyList.querySelector('.journey-add');
                    this.journeyList.insertBefore(this.formatJourney(journey), addNode);
                    this.hasChanged();
                }
            });
        }
    }

    deleteJourney(elem) {
        elem.remove();
        this.hasChanged();
    }

    editJourney(elem) {
        const editor = new JourneyConfigEditorSiteSelect(this.panel);
        editor.getJourney((journey) => {
            if (journey) {
                this.journeyList.replaceChild(this.formatJourney(journey), elem);
                this.hasChanged();
            }
        });
    }

    rigJourney(elem) {
        elem.addEventListener('click', () => {
            if (!elem.classList.contains('selected')) {
                const oldSelected = this.journeyList.querySelector('.selected');
                if (oldSelected) {
                    oldSelected.classList.remove('selected');
                }

                elem.classList.add('selected');
            }
        });

        const buttonDelete = elem.querySelector('.journey-edit-delete-buttons .delete');
        const buttonEdit = elem.querySelector('.journey-edit-delete-buttons .edit');

        buttonDelete.addEventListener('click', () => this.deleteJourney(elem));
        buttonEdit.addEventListener('click', () => this.editJourney(elem));

        return elem;
    }

    rigAddButton(elem) {
        elem.addEventListener('click', () => this.addJourney());
        return elem;
    }

    formatJourney(journey) {
        const elem = createJourneyNode(journey);
        elem.append(cloneTemplate('journey-edit-delete-buttons'));

        this.rigJourney(elem);

        return elem;
    }

    loadJourniesConfig() {
        removeChildren(this.journeyList);

        makeHTTPRequest('GET', '/api/journies-config.json', null, this.spinner)
            .then(JSON.parse)
            .then((journies) => {
                journies.forEach((journey) => {
                    const elem = this.formatJourney(journey);
                    this.journeyList.append(elem);
                });
                const add = cloneTemplate('journey-add');

                this.journeyList.append(this.rigAddButton(add));
            });
    }
}

class WifiConfigPanel {
    constructor() {
        this.panel = document.getElementById('tab-panel-configure-wifi');
        this.container = this.panel.querySelector('.wifi-list-container');
        this.wifiList = this.container.querySelector('.wifi-list');
        this.spinner = new SpinnerProgressHandler(this.panel);

        this.listResult = [];
        this.scanResult = [];
    }

    static getSSID(ap) {
        const nodeSSID = ap.querySelector('.ssid');
        return nodeSSID.dataset.ssid;
    }

    static compareAP(a, b) {
        if (a.matches('.connected, .connecting')) return -1;
        if (b.matches('.connected, .connecting')) return +1;

        const aRSSI = WifiConfigPanel.classifyRSSI(a.querySelector('.rssi').dataset.rssi);
        const bRSSI = WifiConfigPanel.classifyRSSI(b.querySelector('.rssi').dataset.rssi);

        if (aRSSI !== bRSSI) {
            if (!aRSSI) return +1;
            if (!bRSSI) return -1;
            if (bRSSI > aRSSI) return +1;
            return -1;
        }

        const aSSID = WifiConfigPanel.getSSID(a);
        const bSSID = WifiConfigPanel.getSSID(b);

        if (aSSID > bSSID) return +1;
        if (aSSID < bSSID) return -1;

        return 0;
    }

    connect(elem) {
        const ssid = WifiConfigPanel.getSSID(elem);
        const password = elem.querySelector('input.password').value;

        const body = JSON.stringify({ ssid, password });

        elem.querySelector('button.connect').disabled = true;

        makeHTTPRequest('POST', '/api/wifi-list.json', body)
            .then(() => {
                const old = this.wifiList.querySelector('.connected, .connecting');
                if (old) {
                    old.classList.remove('connected', 'connecting');
                    this.insertSortAP(old);
                }
                elem.classList.add('connecting');
                this.insertSortAP(elem);
            })
            .then(() => this.update());
    }

    forget(elem) {
        const ssid = WifiConfigPanel.getSSID(elem);
        const body = JSON.stringify({ ssid });

        elem.querySelector('button.forget').disabled = true;

        makeHTTPRequest('DELETE', '/api/wifi-list.json', body)
            .then(() => {
                if (elem.matches('.rssi-0')) {
                    elem.remove();
                } else {
                    elem.classList.remove('connected', 'saved');
                    elem.querySelector('input.password').placeholder = '';
                    elem.querySelector('button.forget').disabled = true;
                    elem.querySelector('button.connect').disabled = elem.matches('.secure');
                }
            })
            .finally(() => this.update({ force: true }));
    }

    rigAP(elem) {
        elem.addEventListener('click', () => {
            if (!elem.matches('.selected')) {
                const oldSelected = this.wifiList.querySelector('.selected');
                if (oldSelected) {
                    oldSelected.classList.remove('selected');
                }

                elem.classList.add('selected');
            }
        });

        const inputPassword = elem.querySelector('input.password');
        const buttonConnect = elem.querySelector('button.connect');
        const buttonForget = elem.querySelector('button.forget');

        inputPassword.addEventListener('input', () => {
            if (inputPassword.value !== '') {
                buttonConnect.disabled = false;
            } else {
                buttonConnect.disabled = !elem.classList.contains('saved');
            }
        });

        buttonForget.addEventListener('click', () => this.forget(elem));
        buttonConnect.addEventListener('click', () => this.connect(elem));
    }

    findAP(ssid) {
        const apList = Array.from(this.wifiList.children);
        return apList.find(ap => ssid === WifiConfigPanel.getSSID(ap));
    }

    static classifyRSSI(rssi) {
        if (rssi > -72) return 'rssi-5';
        if (rssi > -77) return 'rssi-4';
        if (rssi > -83) return 'rssi-3';
        if (rssi > -92) return 'rssi-2';
        if (rssi > -128) return 'rssi-1';
        return 'rssi-0';
    }

    static addRSSI(elem, rssi) {
        if (rssi) {
            elem.classList.remove('rssi-0', 'rssi-1', 'rssi-2', 'rssi-3', 'rssi-4', 'rssi-5');
            elem.classList.add(WifiConfigPanel.classifyRSSI(rssi));
            elem.querySelector('.rssi').dataset.rssi = rssi;
        } else if (!elem.className.split(' ').some(c => /rssi-.*/.test(c))) {
            elem.classList.add('rssi-0');
        }
    }

    static addEncryption(elem, encryption) {
        if (encryption) {
            if (encryption === 'none') {
                elem.classList.remove('secure');
                elem.classList.add('unsecure');
            } else {
                elem.classList.remove('unsecure');
                elem.classList.add('secure');
                elem.querySelector('form input.password').disabled = false;
            }
        }
    }

    static addSaved(elem, saved) {
        if (saved) {
            elem.classList.add('saved');
            elem.querySelector('button.forget').disabled = false;
            elem.querySelector('input.password').placeholder = 'Use saved password';
        }
    }

    addStatus(elem, status) {
        if (status) {
            const old = this.wifiList.querySelector('.connected, .connecting');
            if (old) {
                old.classList.remove('connected', 'connecting');
            }
            elem.classList.add(status);
        }
    }

    static setButtonStatus(elem) {
        const buttonConnect = elem.querySelector('button.connect');

        if (elem.matches('.rssi-0')) {
            buttonConnect.disabled = true;
        } else if (elem.matches('.saved, .unsecure')) {
            buttonConnect.disabled = false;
        }
    }

    insertSortAP(elem) {
        const sibling = Array.from(this.wifiList.children)
            .find(el => WifiConfigPanel.compareAP(el, elem) > 0);

        if (sibling && elem.nextSibling !== sibling) {
            this.wifiList.insertBefore(elem, sibling);
        }
    }

    addAP(ap) {
        let elem = this.findAP(ap.ssid);

        if (!elem) {
            elem = cloneTemplate('wifi-ap');
            elem.querySelector('.ssid').dataset.ssid = ap.ssid;
            elem.querySelector('input.password').id = `password-${ap.ssid.replace(' ', '-')}`;
            this.rigAP(elem);
            this.wifiList.append(elem);
        }

        WifiConfigPanel.addRSSI(elem, ap.rssi);
        WifiConfigPanel.addEncryption(elem, ap.encryption);
        WifiConfigPanel.addSaved(elem, ap.saved);
        this.addStatus(elem, ap.status);
        WifiConfigPanel.setButtonStatus(elem);

        if (!this.wifiList.querySelector('.selected')) {
        this.insertSortAP(elem);
    }
    }

    updateList() {
        return makeHTTPRequest('GET', '/api/wifi-list.json', null, this.spinner)
            .then(JSON.parse)
            .then((result) => { this.listResult = result; return result; });
    }

    updateScan() {
        const connecting = this.wifiList.querySelector('.connecting');

        if (!this.scanResult.length || !connecting) {
            return makeHTTPRequest('GET', '/api/wifi-scan.json', null, this.spinner)
                .then(JSON.parse)
                .then((result) => { this.scanResult = result; return result; });
        }
        return this.scanResult;
    }

    doUpdate() {
        return this.updateList()
            .then(() => this.updateScan())
            .then(() => {
                const result = [].concat(this.listResult, this.scanResult);
                result.forEach(ap => this.addAP(ap));

                Array.from(this.wifiList.children)
                    .filter((elem) => {
                        const ssid = WifiConfigPanel.getSSID(elem);
                        return !result.find(ap => ap.ssid === ssid);
                    })
                    .forEach(elem => elem.remove());
            });
    }

    update(options) {
        if (options && options.force) {
            this.scanResult = [];
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.startUpdateLoop();
        }
    }

    startUpdateLoop() {
        this.timeoutId = null;
        if (this.doUpdates) {
            this.doUpdate()
                .catch(err => console.warn(err))
                .finally(() => {
                    let timeout = 10000;
                    if (this.wifiList.querySelector('.connecting')) {
                        timeout = 1000;
                    }
                    this.timeoutId = setTimeout(() => this.startUpdateLoop(), timeout);
                });
        }
    }

    activate() {
        this.doUpdates = true;
        this.startUpdateLoop();
    }

    deactivate() {
        this.doUpdates = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }
}

class OverviewPanel {
    constructor() {
        this.panel = document.getElementById('tab-panel-overview');

        /* eslint-disable no-use-before-define */
        this.panel.querySelector('#status-section-header-wifi').addEventListener('click', () => activatePanel('configure-wifi'));
        this.panel.querySelector('#status-section-header-journies').addEventListener('click', () => activatePanel('configure-journies'));

        const links = Array.from(this.panel.querySelectorAll('#status-extra-links a'));
        links.forEach((a) => {
            const panelName = a.getAttribute('href');
            a.addEventListener('click', (ev) => {
                activatePanel(panelName);
                ev.preventDefault();
            });
        });
        /* eslint-enable no-use-before-define */

        this.spinner = new SpinnerProgressHandler(this.panel);
    }

    statusWifi(status) {
        this.panel.querySelector('#status-wifi-mode').innerText = status.wifi.mode;

        this.panel.querySelector('.status-wifi-station .status-wifi-ssid').innerText = status.wifi.station.ssid || '';
        this.panel.querySelector('.status-wifi-station .status-wifi-ip').innerText = status.wifi.station.ip || '';
        this.panel.querySelector('.status-wifi-station .status-wifi-netmask').innerText = status.wifi.station.netmask || '';
        this.panel.querySelector('.status-wifi-station .status-wifi-gateway').innerText = status.wifi.station.gateway || '';

        if (status.wifi.mode.includes('SoftAP')) {
            this.panel.querySelector('.status-wifi-softap-section').style.display = 'block';
            this.panel.querySelector('.status-wifi-softap .status-wifi-ssid').innerText = status.wifi.softAP.ssid || '';
            this.panel.querySelector('.status-wifi-softap .status-wifi-ip').innerText = status.wifi.softAP.ip || '';
            this.panel.querySelector('.status-wifi-softap .status-wifi-connected-stations').innerText = status.wifi.softAP['connected-stations'] || 0;
        } else {
            this.panel.querySelector('.status-wifi-softap-section').style.display = 'none';
        }
        return status;
    }

    statusTime(status) {
        this.panel.querySelector('#status-time-now').innerText = status.time.now;
        this.panel.querySelector('#status-tz-name').innerText = status.time.timezone.name;
        this.panel.querySelector('#status-tz-abbrev').innerText = status.time.timezone.abbrev;
        this.panel.querySelector('#status-tz-next-update').innerText = status.time.timezone['next-update'];

        return status;
    }

    statusJournies(status) {
        const journies = this.panel.querySelector('#status-journey-list');
        removeChildren(journies);

        status.journies.forEach((journey, index) => {
            const elem = cloneTemplate('status-journey');

            elem.querySelector('h4').innerText = `Journey #${index + 1}`;
            elem.querySelector('.status-journey-from').innerText = journey.stop;
            elem.querySelector('.status-journey-to').innerText = journey.destination;
            elem.querySelector('.status-journey-line').innerText = journey.line;
            elem.querySelector('.status-journey-departure-time').innerText = journey.departures[0] || 'None';
            elem.querySelector('.status-journey-update-time').innerText = journey['next-update'] || 'None';

            const icon = cloneJourneyIcon(journey.mode);
            if (icon) {
                elem.querySelector('.status-journey-icon').append(icon);
            }

            journies.append(elem);
        });

        return status;
    }

    statusSystem(status) {
        this.panel.querySelector('#status-system-heap').innerText = `${status.system.heap} bytes`;

        const taskList = this.panel.querySelector('#status-task-list');

        removeChildren(taskList);

        status.system.tasks.forEach((task) => {
            const elem = cloneTemplate('status-task');
            elem.querySelector('.status-task-name').innerText = task.name;
            elem.querySelector('.status-task-stack').innerText = `${task.stack} bytes`;
            taskList.append(elem);
        });
        return status;
    }

    activate() {
        makeHTTPRequest('GET', '/api/status.json', null, this.spinner)
            .then(JSON.parse)
            .then(result => this.statusWifi(result))
            .then(result => this.statusTime(result))
            .then(result => this.statusJournies(result))
            .then(result => this.statusSystem(result));
    }
}

class LogPanel {
    constructor() {
        this.panel = document.getElementById('tab-panel-log');
        this.spinner = new SpinnerProgressHandler(this.panel);
        this.logList = this.panel.querySelector('.log-list');
    }

    fetchLog() {
        const JanFirst2018 = new Date(2018, 1, 1).getTime() / 1000;
        return makeHTTPRequest('GET', '/api/log.json', null, this.spinner)
            .then(JSON.parse)
            .then((result) => {
                if (this.logList.lastChild && this.logList.lastChild.dataset) {
                    const lastOld = result.findIndex((entry) => {
                        const a = JSON.stringify(entry);
                        const b = this.logList.lastChild.dataset.entry;
                        return a === b;
                    });
                    console.log(`Skipping ${lastOld} log entries`);
                    if (lastOld > 0) {
                        result.splice(0, lastOld);
                    }
                }

                result.forEach((entry) => {
                    if (!Array.from(this.logList.children)
                        .find(e => e.dataset.entry === JSON.stringify(entry))) {
                        const elem = cloneTemplate('log-entry');

                        if (entry.timestamp > JanFirst2018) {
                            const d = new Date(entry.timestamp * 1000);

                            const h = `${d.getHours() < 10 ? 0 : ''}${d.getHours()}`;
                            const m = `${d.getMinutes() < 10 ? 0 : ''}${d.getMinutes()}`;
                            const s = `${d.getSeconds() < 10 ? 0 : ''}${d.getSeconds()}`;

                            elem.querySelector('.log-timestamp').innerText = `${h}:${m}:${s}`;
                        }

                        elem.querySelector('.log-message').innerText = entry.message;
                        elem.querySelector('.log-system').innerText = `[${this.systems[entry.system]}]`;

                        elem.dataset.entry = JSON.stringify(entry);
                        this.logList.append(elem);
                    }
                });
            });
    }

    beginFecthLoop() {
        this.timeoutId = null;
        this.fetchLog()
            .then(() => {
                const message = this.panel.querySelector('.header .message');
                message.innerText = `Showing ${this.logList.children.length} log entries`;
                if (this.doFetch) {
                    this.timeoutId = setTimeout(() => this.beginFecthLoop(), 5000);
                }
            });
    }


    activate() {
        if (!this.systems) {
            makeHTTPRequest('GET', '/api/syslog-config.json', null, this.spinner)
                .then(JSON.parse)
                .then((result) => {
                    this.systems = result.systems;
                    this.levels = result.levels;
                    this.systemLevels = result['system-levels'];
                })
                .then(() => {
                    this.doFetch = true;
                    this.beginFecthLoop();
                });
        } else {
            this.doFetch = true;
            this.beginFecthLoop();
        }
    }

    deactivate() {
        this.doFetch = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }
}

class SettingsPanel {
    constructor() {
        this.panel = document.getElementById('tab-panel-settings');
        this.spinner = new SpinnerProgressHandler(this.panel);

        const ip = this.panel.querySelector('input[name="syslog-ip"]');
        const enabled = this.panel.querySelector('input[name="syslog-enabled"]');

        enabled.addEventListener('click', () => {
            ip.disabled = !enabled.checked;
            this.checkIPWarning();
            this.settingsChanged();
        });

        ip.addEventListener('input', () => {
            this.checkIPWarning();
            this.settingsChanged();
        });

        const buttonReset = this.panel.querySelector('.buttons-drawer .reset');
        buttonReset.addEventListener('click', () => this.loadSyslogConfig());

        const buttonSave = this.panel.querySelector('.buttons-drawer .save');
        buttonSave.addEventListener('click', () => this.saveSyslogConfig());
    }

    checkIPWarning() {
        const warning = this.panel.querySelector('.syslog-ip-warning');

        if (this.syslogEnabled() && !this.syslogIPValid()) {
            warning.style.visibility = 'visible';
        } else {
            warning.style.visibility = 'hidden';
        }
    }

    settingsChanged() {
        const buttonSave = this.panel.querySelector('.buttons-drawer .save');
        const buttonReset = this.panel.querySelector('.buttons-drawer .reset');

        buttonSave.disabled = this.syslogEnabled() && !this.syslogIPValid();
        buttonReset.disabled = false;
    }

    syslogEnabled() {
        const enabled = this.panel.querySelector('input[name="syslog-enabled"]');
        return enabled.checked;
    }

    syslogIPValid() {
        const ip = this.panel.querySelector('input[name="syslog-ip"]');
        const regexp = /^([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/;
        const matches = ip.value.match(regexp);
        if (matches) {
            const octets = matches.slice(1, 5);

            return octets.reduce((result, val) => result && (val <= 255), true);
        }
        return false;
    }

    saveSyslogConfig() {
        makeHTTPRequest('POST', '/api/syslog-config.json', JSON.stringify(this.constructSyslogConfig()), this.spinner)
            .then(() => this.loadSyslogConfig());
    }

    constructSyslogConfig() {
        const checked = Array.from(this.panel.querySelectorAll('.settings-syslog-levels input[type=radio]:checked'));
        const systemLevels = checked.map(elem => Number(elem.value));

        const ip = this.panel.querySelector('input[name="syslog-ip"]');

        const config = {};
        config.enabled = this.syslogEnabled();

        if (this.syslogIPValid()) {
            config.ip = ip.value;
        }
        config['system-levels'] = systemLevels;

        return config;
    }

    loadSyslogConfig() {
        return makeHTTPRequest('GET', '/api/syslog-config.json', null, this.spinner)
            .then(JSON.parse)
            .then((result) => {
                const enabled = this.panel.querySelector('input[name="syslog-enabled"]');
                enabled.checked = result.enabled;

                const ip = this.panel.querySelector('input[name="syslog-ip"]');
                ip.value = result.ip;

                const syslog = this.panel.querySelector('.settings-syslog-levels');

                removeChildren(syslog);

                syslog.style.gridTemplateColumns = `1fr repeat(${result.levels.length},auto) 1fr`;

                    syslog.append(document.createElement('span'));
                result.levels.forEach((level) => {
                        const elem = document.createElement('span');
                        elem.innerText = level;
                        elem.classList.add('syslog-level');
                        syslog.append(elem);
                    });

                syslog.append(document.createElement('span'));
                result.systems.forEach((system, i) => {
                        const title = document.createElement('span');
                        title.innerText = system;
                        title.classList.add('syslog-system');
                        syslog.append(title);

                    result.levels.forEach((_, j) => {
                            const elem = document.createElement('input');
                            elem.type = 'radio';
                            elem.name = system;
                            elem.value = j;

                        if (result['system-levels'][i] === j) {
                                elem.checked = true;
                            }

                        elem.addEventListener('click', () => this.settingsChanged());
                            syslog.append(elem);
                        });
                    syslog.append(document.createElement('span'));
                    });

                const buttonReset = this.panel.querySelector('.buttons-drawer .reset');
                const buttonSave = this.panel.querySelector('.buttons-drawer .save');

                buttonSave.disabled = true;
                buttonReset.disabled = true;
                });
    }

    activate() {
        this.loadSyslogConfig()
            .then(() => console.log(this.constructSyslogConfig()));
    }
}

const tabs = {
    overview: {
        Class: OverviewPanel,
    },

    'configure-wifi': {
        Class: WifiConfigPanel,
    },

    'configure-journies': {
        Class: JourneyConfigPanel,
    },

    log: {
        Class: LogPanel,
    },

    settings: {
        Class: SettingsPanel,
    },
};

function activatePanelBare(name) {
    const oldTabListItem = document.querySelector('.tab-list-item.active');
    const oldPanel = document.querySelector('.tab-panel.active');

    const newTabListItem = document.getElementById(`tab-list-item-${name}`);
    const newPanel = document.getElementById(`tab-panel-${name}`);

    if (newPanel) {
        if (oldPanel) {
        if (oldTabListItem) {
            oldTabListItem.classList.remove('active');
            }

            oldPanel.classList.remove('active');

            const oldName = oldPanel.id.replace('tab-panel-', '');

            if (tabs[oldName] && tabs[oldName].obj && tabs[oldName].obj.deactivate) {
                tabs[oldName].obj.deactivate();
            }
        }

        if (newTabListItem) {
        newTabListItem.classList.add('active');
        }

        newPanel.classList.add('active');

        if (tabs[name] && tabs[name].obj && tabs[name].obj.activate) {
            tabs[name].obj.activate();
        }
    } else {
        console.log(`Panel ${name} not found`);
    }
}

function activatePanel(name) {
    window.history.pushState({ tab: name }, '');
    activatePanelBare(name);
}

document.addEventListener('DOMContentLoaded', () => {
    Object.values(tabs).forEach((tab) => {
        if (tab.Class) {
            tab.obj = new tab.Class();
        }
    });

    const tabListItems = Array.from(document.querySelectorAll('.tab-list-item'));

    tabListItems.forEach((item) => {
        const tabName = item.id.replace('tab-list-item-', '');
        item.addEventListener('click', () => {
            if (!item.classList.contains('active')) {
                activatePanel(tabName);
            }
        });
    });

    if (window.history.state && window.history.state.tab) {
        activatePanelBare(window.history.state.tab);
    } else {
        window.history.replaceState({ tab: 'overview' }, '');
        activatePanelBare('overview');
    }

    window.onpopstate = (ev) => {
        activatePanelBare(ev.state.tab);
    };

    window.addEventListener('click', (ev) => {
        const activePanel = document.querySelector('.tab-panel.active');
        if (!ev.target.closest('.selectable')) {
            const selected = activePanel.querySelector('.selected');
            if (selected) {
                selected.classList.remove('selected');
            }
        }
        console.log(ev.targ et.closest('.selectable'));
    });
});
