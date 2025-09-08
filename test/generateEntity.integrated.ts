import { spawn } from 'child_process';

// Reusable function to build JSON-RPC messages with Content-Length header
function buildJsonRpcMessage(id: number, method: string, params?: any): string {
    const request = {
        jsonrpc: '2.0',
        id,
        method,
        ...(params && { params }),
    };

    const jsonContent = JSON.stringify(request);
    return `Content-Length: ${jsonContent.length}\n\n${jsonContent}\n`;
}

console.log('Starting MCP server test...');
const child = spawn('node', ['./dist/index.js'], {
    stdio: ['pipe', 'pipe', 'inherit'],
});

let responseBuffer = '';

child.stdout.on('data', (data) => {
    responseBuffer += data.toString();
    // Process complete JSON-RPC messages
    const lines = responseBuffer.split('\n');
    responseBuffer = lines.pop() || ''; // Keep incomplete line

    for (const line of lines) {
        if (line.trim()) {
            try {
                const response = JSON.parse(line.trim());
                console.log('\n=== MCP SERVER RESPONSE ===');
                console.log(JSON.stringify(response, null, 2));
                console.log('=== END RESPONSE ===\n');
            } catch (e) {
                console.log('Raw output:', line.trim());
            }
        }
    }
});

child.on('error', (err) => {
    console.error('Child process error:', err);
});

child.on('exit', (code, signal) => {
    console.log('Child process exited with code:', code, 'signal:', signal);
});

// Send initialization request
console.log('Sending initialization request...');
const initMessage = buildJsonRpcMessage(1, 'initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
        name: 'test-client',
        version: '1.0.0',
    },
});
child.stdin.write(initMessage);

// Wait a bit then send the tool call
setTimeout(() => {
    console.log('Sending tool request...');
    const toolMessage = buildJsonRpcMessage(2, 'tools/call', {
        name: 'generateEntity',
        arguments: {
            entityName: 'Invoice',
            aggregateRoot: true,
            attributes: [{ name: 'id', type: 'UUID', valueObject: false }],
            methods: [{ name: 'close', parameters: [{ name: 'absolute', type: 'boolean' }] }],
        },
    });
    child.stdin.write(toolMessage);

    // Exit after a few seconds
    setTimeout(() => {
        child.kill();
    }, 3000);
}, 1000);
