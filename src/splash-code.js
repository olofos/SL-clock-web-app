/* global main */

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

class Progress {
    constructor(curr, tot, msg) {
        this.divPos = document.querySelector('.splash .progress.positive');
        this.divNeg = document.querySelector('.splash .progress.negative');

        this.msgPos = this.divPos.querySelector('.message');
        this.msgNeg = this.divNeg.querySelector('.message');

        this.curr = curr;
        this.tot = tot;
        this.msg = msg;

        this.update(0);
    }

    start() { } // eslint-disable-line class-methods-use-this

    stop() { } // eslint-disable-line class-methods-use-this

    update(val) {
        const per = Math.floor(100 * (this.curr + val) / this.tot);

        this.divPos.style.width = `${per}%`;
        this.divNeg.style.width = `${100 - per}%`;

        this.msgPos.innerText = `${this.msg}: ${per}%`;
        this.msgNeg.innerText = `${this.msg}: ${per}%`;
    }

    onprogress(ev) {
        this.update(ev.loaded / ev.total);
    }
}

async function fetchHTML() {
    const res = await makeHTTPRequest('GET', '/app.html', null, new Progress(0, 3, 'Loading HTML'));
    const el = document.createElement('div');
    el.innerHTML = res;
    document.body.appendChild(el.querySelector('.page-container'));
}

async function fetchCSS() {
    const res = await makeHTTPRequest('GET', '/style.css', null, new Progress(1, 3, 'Loading CSS'));
    const el = document.createElement('style');
    el.innerHTML = res;
    document.head.appendChild(el);
}

async function fetchJS() {
    const res = await makeHTTPRequest('GET', '/code.js', null, new Progress(2, 3, 'Loading JS'));
    const el = document.createElement('script');
    el.innerHTML = res;
    document.head.appendChild(el);
}

document.addEventListener('DOMContentLoaded', async () => {
    await fetchHTML();
    await fetchCSS();
    await fetchJS();

    document.querySelector('.splash').style.display = 'none';
    document.querySelector('.page-container').style.display = 'block';
    main();
});
