const port = process.env.PORT || process.env.SERVER_PORT || 3000;
const FILE_PATH = process.env.FILE_PATH || './.npm';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const usehttp = process.env.USEHTTP || '1'; // 0 or 1

const startScript = spawn('bash', ['./start.sh'], {
    env: {
        ...process.env,
        USEHTTP: usehttp
    },
    stdio: ['pipe', 'pipe', 'pipe']
});

startScript.stdout.on('data', (data) => {
    console.log(`[start.sh] ${data.toString().trim()}`);
});
startScript.stderr.on('data', (data) => {
    console.error(`[start.sh ERROR] ${data.toString().trim()}`);
});
startScript.on('error', (error) => {
    console.error(`Failed to start script: ${error.message}`);
});

if (usehttp === '1') {
    const server = http.createServer((req, res) => {
        if (req.url === '/') {
            const indexPath = path.join(__dirname, 'index.html');
            fs.readFile(indexPath, 'utf8', (error, data) => {
                if (error) {
                    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end('hello world');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(data);
                }
            });
        } else if (req.url === '/sub') {
            const subFilePath = path.join(FILE_PATH, 'log.txt');
            fs.readFile(subFilePath, 'utf8', (error, data) => {
                if (error) {
                    res.writeHead(500);
                    res.end('Error reading file');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end(data);
                }
            });
        } else {
            res.writeHead(404);
            res.end('Not found');
        }
    });
    server.listen(port, () => {
        console.log(`server is listening on port ${port}`);
    });
} else if (usehttp === '0') {
    console.log(`server is listening on port ${port}`);
}
