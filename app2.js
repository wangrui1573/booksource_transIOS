const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 443;

app.use(express.urlencoded({ extended: true }));

function replaceSelectors(jsonData) {
    function replaceSelector(selector) {
        if (selector.includes('.') && selector.includes('@')) {
            const parts = selector.split('.');
            const tag = parts[0];
            const selectorPart = parts[1];
            if (selectorPart.includes('@')) {
                const [numPart, atText] = selectorPart.split('@'); // 重命名为 numPart
                let num = numPart; // 使用 let 声明新的变量
                if (num.includes(':')) {
                    const [numPart, tagAfterColon] = num.split(':');
                    num = `${numPart}@${tagAfterColon}`;
                }
                if (num.replace('-', '').replace('.', '').match(/^\d+$/)) {
                    num = (num === '0' ? '1' : num);
                    if (num.startsWith('-')) {
                        num = num.substring(1);
                        return `${tag}:nth-last-child(${num})@${atText}`;
                    } else {
                        return `${tag}:nth-child(${num})@${atText}`;
                    }
                }
            }
        }
        return selector;
    }

    if (Array.isArray(jsonData)) {
        jsonData.forEach(item => replaceSelectors(item));
        return;
    }

    for (const key in jsonData) {
        if (typeof jsonData[key] === 'string') {
            if (jsonData[key].includes('@')) {
                jsonData[key] = jsonData[key].replace(/!0/g, ':not(:first-child)');
                jsonData[key] = replaceSelector(jsonData[key]);
            }
        } else if (typeof jsonData[key] === 'object') {
            replaceSelectors(jsonData[key]);
        }
    }

    if (jsonData['bookSourceGroup'] && typeof jsonData['bookSourceGroup'] === 'string') {
        jsonData['bookSourceGroup'] += ',real';
    }

    if (jsonData['ruleExplore'] && jsonData['ruleExplore'].length === 0) {
        jsonData['ruleExplore'] = '##';
    }

        // for (const key in jsonData) {
    //     if (typeof jsonData[key] === 'string' && jsonData[key].includes('.@')) {
    //         jsonData[key] = jsonData[key].replace(/\.@/g, ':nth-child(').replace(/@/g, ')');
    //     }
    // }
    // 替换漫画源
    if (jsonData['bookSourceType'] === 2) {
        jsonData['bookSourceType'] = 3;
    }
    
    for (const key in jsonData) {
        if (typeof jsonData[key] === 'string') {
            if (jsonData[key].includes('@')) {
                jsonData[key] = jsonData[key]
                    .replace(/\.0@/g, ':nth-child(1)@')
                    .replace(/\.1@/g, ':nth-child(1)@')
                    .replace(/\.2@/g, ':nth-child(2)@')
                    .replace(/\.3@/g, ':nth-child(3)@')
                    .replace(/\.4@/g, ':nth-child(4)@')
                    .replace(/\.5@/g, ':nth-child(5)@')
                    .replace(/\.6@/g, ':nth-child(6)@')
                    .replace(/\.7@/g, ':nth-child(7)@')
                    .replace(/\.8@/g, ':nth-child(8)@')
                    .replace(/\.9@/g, ':nth-child(9)@')
                    .replace(/\.(-1)@/g, ':nth-last-child(1)@')
                    .replace(/\.(-2)@/g, ':nth-last-child(2)@')
                    .replace(/\.(-3)@/g, ':nth-last-child(3)@')
                    .replace(/\.(-4)@/g, ':nth-last-child(4)@')
                    .replace(/\.(-5)@/g, ':nth-last-child(5)@')
                    .replace(/\.(-6)@/g, ':nth-last-child(6)@')
                    .replace(/\.(-7)@/g, ':nth-last-child(7)@')
                    .replace(/\.(-8)@/g, ':nth-last-child(8)@')
                    .replace(/\.(-9)@/g, ':nth-last-child(9)@')
                    .replace(",{'webView': true}", "");
    
                jsonData[key] = replaceSelector(jsonData[key]);
            }
        } else if (typeof jsonData[key] === 'object') {
            replaceSelectors(jsonData[key]);
        }
    }
    
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

app.use(express.static(path.join(__dirname, 'public'))); // 设置静态资源目录

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});

app.post('/', async (req, res) => {
    const jsonUrl = req.body.json_url;
    
    try {
        const response = await axios.get(jsonUrl);
        const json = response.data;
        replaceSelectors(json);

        const fileName = jsonUrl.split('/').pop();
        const jsonDir = path.join(__dirname, 'json');
        if (!fs.existsSync(jsonDir)) {
            fs.mkdirSync(jsonDir);
        }

        const jsonPath = path.join(jsonDir, fileName);
        fs.writeFileSync(jsonPath, JSON.stringify(json, null, 4), 'utf-8');

        const downloadLink = `/json/${fileName}`;
        res.render('result', { json_data: json, download_link: downloadLink });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing JSON data');
    }
});

app.get('/json/:file_name', (req, res) => {
    const jsonDir = path.join(__dirname, 'json');
    const filePath = path.join(jsonDir, req.params.file_name);
    res.download(filePath);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});