import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { describe, expect, it } from 'vitest';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

describe('template MCP stdio server', () => {
  it('advertises exactly three tools and reads the real catalog', async () => {
    let stderr = '';
    const transport = new StdioClientTransport({
      command: 'npm',
      args: ['run', '--silent', 'mcp:templates'],
      cwd: path.resolve(projectRoot),
      stderr: 'pipe'
    });
    transport.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });
    const client = new Client({ name: 'approve-please-test', version: '1.0.0' });

    try {
      await client.connect(transport);
      const listed = await client.listTools();
      expect(listed.tools.map((tool) => tool.name).sort()).toEqual([
        'add_template',
        'list_templates',
        'validate_template'
      ]);

      const result = await client.callTool(
        {
          name: 'list_templates',
          arguments: { language: 'typescript' }
        },
        CallToolResultSchema
      );
      expect(result.isError).not.toBe(true);
      if (!Array.isArray(result.content)) {
        throw new Error('Expected an MCP content array.');
      }
      const firstContent = result.content[0];
      if (
        typeof firstContent !== 'object' ||
        firstContent === null ||
        !('type' in firstContent) ||
        firstContent.type !== 'text' ||
        !('text' in firstContent) ||
        typeof firstContent.text !== 'string'
      ) {
        throw new Error('Expected text tool content.');
      }
      const payload = JSON.parse(firstContent.text) as {
        ok: boolean;
        count: number;
      };
      expect(payload.ok).toBe(true);
      expect(payload.count).toBeGreaterThan(0);
    } finally {
      await client.close();
    }

    expect(stderr).toBe('');
  }, 20_000);
});
