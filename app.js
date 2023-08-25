const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 443;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Replacement logic
// 替换选择器函数
function replaceSelectors(jsonData) {

    // 替换选择器
    function replaceSelector(selector) {
      // 实现代码
      // 这里放置替换选择器的逻辑
      return selector; // 返回修改后的选择器
    }
  
    // 处理列表
    if(Array.isArray(jsonData)) {
      jsonData.forEach(item => {
        replaceSelectors(item); 
      });
      return jsonData; // 返回修改后的数组
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
  
    return jsonData; // 返回修改后的对象
}

function processJsonData(jsonData) {
    // Your replace_selectors logic in JavaScript goes here
    // Make sure to update the logic to process JSON data accordingly
    // ...

    return jsonData;
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

app.post('/', async (req, res) => {
    const jsonUrl = req.body.json_url;

    try {
        const response = await axios.get(jsonUrl);
        const jsonData = processJsonData(response.data);

        const fileName = path.basename(jsonUrl);
        const jsonPath = path.join('/tmp', fileName); // 文件保存在 /tmp 目录

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
    const jsonPath = path.join('/tmp', fileName); // 文件保存在 /tmp 目录

    res.download(jsonPath, fileName);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});