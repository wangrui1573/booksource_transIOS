const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 443;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 替换选择器函数
// 替换选择器函数
function replaceSelectors(jsonData) {

    // 替换选择器
    function replaceSelector(selector) {
      // 实现代码
    }
  
    // 处理列表
    if(Array.isArray(jsonData)) {
      jsonData.forEach(item => {
        replaceSelectors(item); 
      });
      return;
    }
  
    // 处理!0为:not(:first-child)
    for(let key in jsonData) {
      if(typeof jsonData[key] === 'string') {
         jsonData[key] = jsonData[key].replace(/!0/g, ':not(:first-child)');
         jsonData[key] = replaceSelector(jsonData[key]); 
      }
    }
  
    // 处理bookSourceGroup
    if(jsonData.bookSourceGroup) {
      jsonData.bookSourceGroup += ',real';
    }
  
    // 处理ruleExplore
    if(jsonData.ruleExplore && !Object.keys(jsonData.ruleExplore).length) {
      jsonData.ruleExplore = '##';
    }
  
    // 处理.n@选择器
    for(let key in jsonData) {
      if(typeof jsonData[key] === 'string') {
        // 各种替换
        jsonData[key] = replaceSelector(jsonData[key]);
      }
    }
  
  }

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

app.post('/', async (req, res) => {
    const jsonUrl = req.body.json_url;

    try {
        const response = await axios.get(jsonUrl);
        const jsonData = replaceSelectors(response.data);

        const fileName = jsonUrl.split('/').pop();
        const jsonPath = path.join(__dirname, 'json', fileName);

        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 4));

        const downloadLink = `/download/${fileName}`;
        res.send(`<a href="${downloadLink}" download>Download JSON</a>`);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred.');
    }
});

app.get('/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const jsonPath = path.join(__dirname, 'json', fileName);

    res.download(jsonPath, fileName);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
