exports.status = {
    system: {
        heap: 42688,
        tasks: [{ name: 'wifi', stack: 140 }, { name: 'sntp', stack: 140 }, { name: 'tzdb', stack: 208 }, { name: 'journey', stack: 549 }, { name: 'httpd', stack: 672 }],
    },
    wifi: {
        mode: 'Station+SoftAP',
        station: {
            status: 'connected',
            ssid: 'TN_24GHz_62FAE1',
            ip: '192.168.10.163',
            netmask: '255.255.255.0',
            gateway: '192.168.10.1',
            rssi: -58,
            'known-networks': ['TN_24GHz_62FAE1', 'Stockholm Makerspace'],
        },
        softAP: {
            ssid: 'MY_ESP8266',
            ip: '192.168.4.1',
            'connected-stations': 2,
        },
    },
    time: {
        now: '2018-09-28 16:10:18',
        timezone: {
            name: 'Europe/Stockholm',
            abbrev: 'CEST-2',
            'next-update': '2018-09-29 16:10:13',
        },
    },
    journies: [
        {
            line: '80',
            stop: 'Saltsjöqvarn',
            destination: 'Nybroplan',
            'site-id': 1442,
            mode: 5,
            direction: 2,
            'next-update': '2018-09-28 16:40:14',
            departures: ['2018-09-28 16:29:00', '2018-09 -28 16:37:00'],
        },
        {
            line: '53',
            stop: 'Henriksdalsberget',
            destination: 'Karolinska institutet',
            'site-id': 1450,
            mode: 1,
            direction: 2,
            'next-update': '2018-09-28 16:40:15',
            departures: [
                '2018-09-28 16:18:00',
                '2018-09-28 16:28:00',
                '2018-09-28 16:39:27',
                '2018-09-28 16:48:00',
                '2018-09-28 16:58:00',
                '2018-09-28 17:08:00',
            ],
        },
    ],
};
