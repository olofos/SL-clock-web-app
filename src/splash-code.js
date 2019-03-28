/* global main */

function makeHTTPRequest(method, url, body, progressHandler) {
    return new Promise((resolve, reject) => {
        const xhttp = new XMLHttpRequest();

        xhttp.open(method, url);

        xhttp.onload = function onload(ev) {
            if (progressHandler) {
                xhttp.onprogress(ev);
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
            xhttp.onprogress = (ev) => {
                const uncompressedLength = xhttp.getResponseHeader('X-Uncompressed-Content-Length');
                if (!ev.lengthComputable && uncompressedLength) {
                    const total = parseInt(uncompressedLength, 10) || 0;
                    const { loaded } = ev;
                    progressHandler.onprogress({ loaded, total, lengthComputable: total > 0 });
                } else {
                    progressHandler.onprogress(ev);
                }
            };

            progressHandler.start();
        }

        xhttp.send(body);
    });
}

class SplashProgress {
    constructor(tot) {
        this.divPos = document.querySelector('.splash .progress.positive');
        this.divNeg = document.querySelector('.splash .progress.negative');

        this.msgPos = this.divPos.querySelector('.message');
        this.msgNeg = this.divNeg.querySelector('.message');

        this.curr = 0;
        this.tot = tot;
    }

    next(msg) {
        this.msg = msg;
        return this;
    }

    start() {
        this.update(0);
    }

    stop() {
        this.curr += 1;
    }

    update(val) {
        const per = Math.floor(100 * (this.curr + val) / this.tot);

        this.divPos.style.width = `${per}%`;
        this.divNeg.style.width = `${100 - per}%`;

        this.msgPos.innerText = `${this.msg}: ${per}%`;
        this.msgNeg.innerText = `${this.msg}: ${per}%`;
    }

    onprogress(ev) {
        console.log(ev.loaded, ev.total);
        this.update(ev.loaded / ev.total);
    }
}

async function fetchHTML(prog) {
    const res = await makeHTTPRequest('GET', '/app.html', null, prog.next('Loading HTML'));
    const el = document.createElement('div');
    el.innerHTML = res;
    document.body.appendChild(el.querySelector('.page-container'));
}

async function fetchCSS(prog) {
    const res = await makeHTTPRequest('GET', '/style.css', null, prog.next('Loading CSS'));
    const el = document.createElement('style');
    el.innerHTML = res;
    document.head.appendChild(el);
}

async function fetchJS(prog) {
    const res = await makeHTTPRequest('GET', '/code.js', null, prog.next('Loading JS'));
    const el = document.createElement('script');
    el.innerHTML = res;
    document.head.appendChild(el);
}

document.addEventListener('DOMContentLoaded', async () => {
    const prog = new SplashProgress(3);
    await fetchHTML(prog);
    await fetchCSS(prog);
    await fetchJS(prog);

    document.querySelector('.splash').style.display = 'none';
    document.querySelector('.page-container').style.display = 'block';
    main();
});
