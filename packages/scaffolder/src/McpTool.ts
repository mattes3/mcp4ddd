export type McpTool = {
    name: string;
    config: {
        title: string;
        description: string;
        inputSchema: any;
        outputSchema: any;
    };
    execute: (params: any) => Promise<{
        content: Array<{ type: 'text'; text: string }>;
        structuredContent: any;
    }>;
};
