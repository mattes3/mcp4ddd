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

// Wait a bit then send the entity generation request
setTimeout(() => {
    console.log('Sending entity generation request...');
    const entityMessage = buildJsonRpcMessage(2, 'tools/call', {
        name: 'generateEntity',
        arguments: {
            entityName: 'Contract',
            aggregateRoot: true,
            attributes: [],
            methods: [{ name: 'close', parameters: [{ name: 'absolute', type: 'boolean' }] }],
            boundedContext: 'stocks',
            layer: 'domain',
        },
    });
    child.stdin.write(entityMessage);

    // Send DynamoDB repository generation request after entity
    setTimeout(() => {
        console.log('Sending DynamoDB repository generation request...');
        const dynamoMessage = buildJsonRpcMessage(3, 'tools/call', {
            name: 'generateDynamoDBRepository',
            arguments: {
                boundedContext: 'stocks',
                aggregateName: 'Contract',
                attributes: [{ name: 'id', type: 'string', required: true }],
                indexes: {
                    primary: {
                        pk: { field: 'pk', composite: ['id'] },
                        sk: { field: 'sk', composite: [] },
                    },
                },
            },
        });
        child.stdin.write(dynamoMessage);

        // Exit after a few more seconds
        setTimeout(() => {
            child.kill();
        }, 3000);
    }, 2000);
}, 1000);
