const statusReply = JSON.parse('{"system":{"heap":42704,"tasks":[{"name":"wifi","stack":140},{"name":"sntp","stack":140},{"name":"tzdb","stack":208},{"name":"journey","stack":596},{"name":"httpd","stack":677}]},"wifi":{"mode":"Station","station":{"status":"connected","ssid":"TN_24GHz_62FAE1","ip":"192.168.10.163","netmask":"255.255.255.0","gateway":"192.168.10.1","rssi":-66},"known-networks":["TN_24GHz_62FAE1","Stockholm Makerspace"]},"time":{"now":"2018-09-24 19:24:15","timezone":{"name":"Europe/Stockholm","abbrev":"CEST-2","next-update":"2018-09-25 19:23:50"}},"journies":[{"line":"80","stop":"Saltsjöqvarn","destination":"Nybroplan","site-id":1442,"mode":5,"direction":2,"next-update":"2018-09-24 19:53:51","departures":["2018-09-24 19:47:00"]},{"line":"53","stop":"Henriksdalsberget","destination":"Karolinska institutet","site-id":1450,"mode":1,"direction":2,"next-update":"2018-09-24 19:53:51","departures":["2018-09-24 19:37:00","2018-09-24 19:52:00","2018-09-24 20:12:00"]}]}');

const wifiReply = JSON.parse('[{"ssid":"thevictimandtheking","rssi":-92,"encryption":"WPA2 PSK"},{"ssid":"TN_24GHz_594F55","rssi":-82,"encryption":"none"},{"ssid":"TN_24GHz_6B1769","rssi":-75,"encryption":"WPA WPA2 PSK"},{"ssid":"TN_24GHz_6C739F","rssi":-76,"encryption":"WPA WPA2 PSK"},{"ssid":"TN_24GHz_AA0F5D","rssi":-69,"encryption":"WPA WPA2 PSK"},{"ssid":"TN_24GHz_C250AB","rssi":-74,"encryption":"WPA WPA2 PSK"},{"ssid":"TN_private_XX9VVV","rssi":-71,"encryption":"WPA WPA2 PSK"},{"ssid":"TN_24GHz_62FAE1","rssi":-52,"encryption":"WPA WPA2 PSK", "status":"connected", "saved":true},{"ssid":"TN_24GHz_6C0D83","rssi":-82,"encryption":"WPA WPA2 PSK"},{"ssid":"Stockholm Makerspace","saved":true,"status":""}]');

const journiesConfigReply = JSON.parse('[{"line":"80","stop":"Saltsjöqvarn","destination":"Nybroplan","site-id":1442,"mode":5,"direction":2},{"line":"624","stop":"Margretelunds centrum","destination":"Åkersberga station östra","site-id":1450,"mode":1,"direction":2}]');

const placesReply = JSON.parse('[{"Name":"Henriksdal (Stockholm)","SiteId":"9432","Type":"Station","X":"18107529","Y":"59311537"},{"Name":"Henriksdalsberget (Nacka)","SiteId":"1450","Type":"Station","X":"18117264","Y":"59311124"},{"Name":"Henriksdalsviadukten (Stockholm)","SiteId":"1447","Type":"Station","X":"18108203","Y":"59311429"},{"Name":"Henriksberg (Norrtälje)","SiteId":"6571","Type":"Station","X":"18252507","Y":"59783866"},{"Name":" Henriksdals brygga (båt) (Stockholm)","SiteId":"313","Type":"Station","X":"18101281","Y":"59309272"},{"Name":"Hensviks vägskäl (Norrtälje)","SiteId":"6882","Type":"Station","X":"18631106","Y":"60113663"},{"Name":"Henningsberg (Huddinge)","SiteId":"7161","Type":"Station","X":"18080966","Y":"59228333"},{"Name":"Fleminggatan/S:t Eriksgatan (Stockholm)","SiteId":"1225","Type":"Station","X":"18032523","Y":"59334873"},{"Name":"S:t Eriksgatan/Fleminggatan (Stockholm)","SiteId":"1225","Type":"Station","X":"18032523","Y":"59334873"},{"Name":"S:t Eriksplan (Stockholm)","SiteId":"9116","Type":"Station","X":"18038636","Y":"59339583"}]');

const journiesSearchReply = JSON.parse('{"LatestUpdate":"2018-09-06T16:50:32","DataAge":58,"Metros":[],"Buses":[{"GroupOfLine":null,"TransportMode":"BUS","LineNumber":"469","Destination":"Finnberget","JourneyDirection":2,"StopAreaName":"Henriksdalsberget","StopAreaNumber":10611,"StopPointNumber":10611,"StopPointDesignation":null,"TimeTabledDateTime":"2018-09-06T16:48:00","ExpectedDateTime":"2018-09-06T16:51:28","DisplayTime":"Nu","JourneyNumber":16613,"Deviations":null},{"GroupOfLine":null,"TransportMode":"BUS","LineNumber":"53","Destination":"Karolinskainstitutet","JourneyDirection":2,"StopAreaName":"Henriksdalsberget","StopAreaNumber":10611,"StopPointNumber":10624,"StopPointDesignation":null,"TimeTabledDateTime":"2018-09-06T16:58:00","ExpectedDateTime":"2018-09-06T16:58:00","DisplayTime":"6min","JourneyNumber":62143,"Deviations":null},{"GroupOfLine":null,"TransportMode":"BUS","LineNumber":"469","Destination":"Nackasjukhus","JourneyDirection":1,"StopAreaName":"Henriksdalsberget","StopAreaNumber":10611,"StopPointNumber":10624,"StopPointDesignation":null,"TimeTabledDateTime":"2018-09-06T17:08:00","ExpectedDateTime":"2018-09-06T17:08:00","DisplayTime":"16min","JourneyNumber":16604,"Deviations":null},{"GroupOfLine":null,"TransportMode":"BUS","LineNumber":"53","Destination":"Karolinskainstitutet","JourneyDirection":2,"StopAreaName":"Henriksdalsberget","StopAreaNumber":10611,"StopPointNumber":10624,"StopPointDesignation":null,"TimeTabledDateTime":"2018-09-06T17:08:00","ExpectedDateTime":"2018-09-06T17:08:00","DisplayTime":"16min","JourneyNumber":62144,"Deviations":null},{"GroupOfLine":null,"TransportMode":"BUS","LineNumber":"53","Destination":"Finnberget","JourneyDirection":1,"StopAreaName":"Henriksdalsberget","StopAreaNumber":10611,"StopPointNumber":10611,"StopPointDesignation":null,"TimeTabledDateTime":"2018-09-06T17:21:00","ExpectedDateTime":"2018-09-06T17:21:00","DisplayTime":"29min","JourneyNumber":62215,"Deviations":null},{"GroupOfLine":null,"TransportMode":"BUS","LineNumber":"53","Destination":"Karolinskainstitutet","JourneyDirection":2,"StopAreaName":"Henriksdalsberget","StopAreaNumber":10611,"StopPointNumber":10624,"StopPointDesignation":null,"TimeTabledDateTime":"2018-09-06T17:21:00","ExpectedDateTime":"2018-09-06T17:21:00","DisplayTime":"29min","JourneyNumber":62145,"Deviations":null},{"GroupOfLine":null,"TransportMode":"BUS","LineNumber":"53","Destination":"Karolinskainstitutet","JourneyDirection":2,"StopAreaName":"Henriksdalsberget","StopAreaNumber":10611,"StopPointNumber":10624,"StopPointDesignation":null,"TimeTabledDateTime":"2018-09-06T17:35:00","ExpectedDateTime":"2018-09-06T17:35:00","DisplayTime":"17:35","JourneyNumber":62146,"Deviations":null},{"GroupOfLine":null,"TransportMode":"BUS","LineNumber":"469","Destination":"Finnberget","JourneyDirection":2,"StopAreaName":"Henriksdalsberget","StopAreaNumber":10611,"StopPointNumber":10611,"StopPointDesignation":null,"TimeTabledDateTime":"2018-09-06T17:41:00","ExpectedDateTime":"2018-09-06T17:41:00","DisplayTime":"17:41","JourneyNumber":16614,"Deviations":null},{"GroupOfLine":null,"TransportMode":"BUS","LineNumber":"53","Destination":"Karolinskainstitutet","JourneyDirection":2,"StopAreaName":"Henriksdalsberget","StopAreaNumber":10611,"StopPointNumber":10624,"StopPointDesignation":null,"TimeTabledDateTime":"2018-09-06T17:48:00","ExpectedDateTime":"2018-09-06T17:48:00","DisplayTime":"17:48","JourneyNumber":62095,"Deviations":null}],"Trains":[],"Trams":[],"Ships":[],"StopPointDeviations":[]}');

function cloneTemplate(name) {
    const id = `template-${name}`;

    const node = document.getElementById(id).content.children[0];
    return node.cloneNode(true);
}

function cloneIcon(name) {
    const icons = document.getElementById('template-icons').content;
    const icon = icons.querySelector(`.${name}`);

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

function classifyRSSI(rssi) {
    if (rssi > -72) {
        return 'rssi-5';
    }
    if (rssi > -77) {
        return 'rssi-4';
    }
    if (rssi > -83) {
        return 'rssi-3';
    }
    if (rssi > -92) {
        return 'rssi-2';
    }
    if (rssi > -128) {
        return 'rssi-1';
    }
    return 'rssi-0';
}


document.addEventListener('DOMContentLoaded', () => {
    const tabListItems = Array.from(document.querySelectorAll('.tab-list-item'));

    tabListItems.forEach((item) => {
        item.addEventListener('click', () => {
            if (!item.classList.contains('active')) {
                document.querySelector('.tab-list-item.active').classList.remove('active');
                document.querySelector('.tab-panel.active').classList.remove('active');

                item.classList.add('active');

                document.querySelector(`#${item.id.replace('tab-list-item', 'tab-panel')}`).classList.add('active');
            }
        });
    });

    (() => {
        document.querySelector('#status-wifi-mode').innerText = statusReply.wifi.mode;
        document.querySelector('#status-wifi-ssid').innerText = statusReply.wifi.station.ssid;
        document.querySelector('#status-wifi-ip').innerText = statusReply.wifi.station.ip;
        document.querySelector('#status-wifi-netmask').innerText = statusReply.wifi.station.netmask;
        document.querySelector('#status-wifi-gateway').innerText = statusReply.wifi.station.gateway;

        document.querySelector('#status-tz-name').innerText = statusReply.time.timezone.name;
        document.querySelector('#status-tz-abbrev').innerText = statusReply.time.timezone.abbrev;
        document.querySelector('#status-tz-next-update').innerText = statusReply.time.timezone['next-update'];

        const journies = document.querySelector('#status-section-journies');

        statusReply.journies.forEach((journey, index) => {
            const elem = cloneTemplate('status-journey');

            elem.querySelector('h4').innerText = `Journey #${index + 1}`;
            elem.querySelector('.status-journey-from').innerText = journey.stop;
            elem.querySelector('.status-journey-to').innerText = journey.destination;
            elem.querySelector('.status-journey-line').innerText = journey.line;

            const icon = cloneJourneyIcon(journey.mode);
            if (icon) {
                elem.querySelector('.status-journey-icon').append(icon);
            }

            journies.append(elem);
        });
    })();

    (() => {
        const wifiList = document.querySelector('#tab-panel-configure-wifi .wifi-list');

        wifiReply.forEach((ap, index) => {
            const elem = cloneTemplate('wifi-ap');

            elem.querySelector('.ssid').dataset.ssid = ap.ssid;
            elem.classList.add(classifyRSSI(ap.rssi));
            if (ap.encryption) {
                if (ap.encryption === 'none') {
                    elem.classList.add('unsecure');
                } else {
                    elem.classList.add('secure');
                }
            }

            if (ap.status === 'connected') {
                elem.classList.add('connected');
            }

            if (ap.status === 'connecting') {
                elem.classList.add('connecting');
            }

            if (index === 0) {
                elem.classList.add('first');
            }

            if (index === wifiReply.length - 1) {
                elem.classList.add('last');
            }

            if (index % 2) {
                elem.classList.add('even');
            } else {
                elem.classList.add('odd');
            }

            elem.addEventListener('click', () => {
                if (!elem.classList.contains('selected')) {
                    const oldSelected = wifiList.querySelector('.selected');
                    if (oldSelected) {
                        oldSelected.classList.remove('selected');
                    }

                    elem.classList.add('selected');
                }
            });

            elem.querySelector('input.password').id = `password-${ap.ssid.replace(' ', '-')}`;

            wifiList.append(elem);
        });

        const panel = document.querySelector('#tab-panel-configure-wifi');
        setInterval(() => {
            panel.classList.remove('done');
            panel.classList.add('loading');
            setTimeout(() => {
                panel.classList.add('done');
            }, 3000);
        }, 5000);

        const spinner = panel.querySelector('.header .spinner');
        spinner.addEventListener('transitionend', () => {
            if (panel.classList.contains('done')) {
                panel.classList.remove('loading', 'done');
            }
        });
    })();

    (() => {
        const journeyList = document.querySelector('#tab-panel-configure-journies .journies-container.config .journey-list');

        journiesConfigReply.forEach((journey) => {
            const elem = cloneTemplate('journey');

            elem.querySelector('.line').innerText = journey.line;
            elem.querySelector('.stop').innerText = journey.stop;
            elem.querySelector('.destination').innerText = journey.destination;

            const icon = cloneJourneyIcon(journey.mode);
            if (icon) {
                elem.querySelector('.icon').append(icon);
            }

            elem.addEventListener('click', () => {
                if (!elem.classList.contains('selected')) {
                    const oldSelected = journeyList.querySelector('.selected');
                    if (oldSelected) {
                        oldSelected.classList.remove('selected');
                    }

                    elem.classList.add('selected');
                }
            });

            elem.append(cloneTemplate('journey-edit-delete-buttons'));

            journeyList.append(elem);
        });

        journeyList.append(cloneTemplate('journey-add'));
    })();

    (() => {
        const container = document.querySelector('#tab-panel-configure-journies .journies-container.journey-select');
        const journeyList = container.querySelector('.journey-list');

        const journies = [].concat(
            journiesSearchReply.Buses,
            journiesSearchReply.Metros,
            journiesSearchReply.Trains,
            journiesSearchReply.Trams,
            journiesSearchReply.Ships,
        );

        journies.forEach((journey) => {
            const elem = cloneTemplate('journey');

            elem.querySelector('.line').innerText = journey.LineNumber;
            elem.querySelector('.stop').innerText = journey.StopAreaName;
            elem.querySelector('.destination').innerText = journey.Destination;

            const icon = cloneIcon(journey.TransportMode.toLowerCase());

            if (icon) {
                elem.querySelector('.icon').append(icon.cloneNode(true));
            }

            elem.addEventListener('click', () => {
                if (!elem.classList.contains('selected')) {
                    const oldSelected = journeyList.querySelector('.selected');
                    if (oldSelected) {
                        oldSelected.classList.remove('selected');
                    }

                    elem.classList.add('selected');

                    container.querySelector('button.ok').disabled = false;
                }
            });

            journeyList.append(elem);
        });
    })();

    (() => {
        const container = document.querySelector('#tab-panel-configure-journies .journies-container.site-select');
        const siteList = container.querySelector('.site-list');

        placesReply.forEach((place) => {
            const elem = cloneTemplate('site');
            elem.querySelector('.name').innerText = place.Name;
            siteList.append(elem);

            elem.addEventListener('click', () => {
                if (!elem.classList.contains('selected')) {
                    const oldSelected = siteList.querySelector('.selected');
                    if (oldSelected) {
                        oldSelected.classList.remove('selected');
                    }

                    elem.classList.add('selected');

                    container.querySelector('button.next').disabled = false;
                }
            });
        });
    })();
});
