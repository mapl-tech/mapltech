#!/usr/bin/env node
/**
 * MAPL TECH Weekly Blog Generator
 * Uses Claude API to write a new post and adds it to src/data/blog-posts.ts
 * Run manually:  node scripts/generate-blog-post.mjs
 * Runs automatically every Monday via .github/workflows/weekly-blog.yml
 */
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_FILE = join(__dirname, '../src/data/blog-posts.ts');

// ── Helpers ──────────────────────────────────────────────────────────────────

function formattedDate() {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function extractSlugs(src) {
  return [...src.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

function extractTitles(src) {
  return [...src.matchAll(/title:\s*["']([^"']+)["']/g)].map((m) => m[1]);
}

async function fetchUnsplashImage(query) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (key) {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${key}`
    );
    if (res.ok) {
      const d = await res.json();
      return {
        url: `${d.urls.raw}?auto=format&fit=crop&w=1200&q=80`,
        alt: d.alt_description || query,
      };
    }
  }
  // Fallback pool - varied tech images
  const pool = [
    'photo-1488229297570-58520851e868',
    'photo-1451187580459-43490279c0fa',
    'photo-1518770660439-4636190af475',
    'photo-1504639725590-34d0984388bd',
    'photo-1550751827-4bd374c3f58b',
    'photo-1677442135703-1787eea5ce01',
    'photo-1555066931-4365d14bab8c',
    'photo-1611532736597-de2d4265fba3',
  ];
  const id = pool[Math.floor(Math.random() * pool.length)];
  return {
    url: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`,
    alt: query,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const client = new Anthropic();
  const src = readFileSync(BLOG_FILE, 'utf-8');
  const existingSlugs = extractSlugs(src);
  const existingTitles = extractTitles(src);
  const today = formattedDate();

  console.log(`Existing posts: ${existingSlugs.length}`);
  console.log('Calling Claude to generate new post…');

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 8192,
    thinking: { type: 'adaptive' },
    system: `You are the lead content writer for MAPL TECH, a technology agency serving clients in Nigeria, Jamaica, and internationally.

MAPL TECH's five content categories:
- "Automation & AI" - workflow automation, AI integrations, LLMs in business, Make/Zapier/n8n, GPT/Claude APIs
- "Web Development" - Next.js, React, TypeScript, performance, Core Web Vitals, deployment
- "Internal Tools" - dashboards, CRMs, client portals, Notion alternatives, custom admin panels
- "Cloud Engineering" - AWS, GCP, Azure, CI/CD pipelines, Infrastructure as Code, DevOps, monitoring, scaling
- "Industry" - digital transformation in Africa and the Caribbean, fintech, payments, tech ecosystem

Author: All posts are published by MAPL TECH (name: "MAPL TECH", role: "Technology Agency").

Voice: sharp, expert, practitioner-level. Specific and concrete  - no corporate fluff.
Content format: Full HTML using <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>. Start with <p class="lead">. Target 700-900 words. Include real tool names, numbers, and actionable insights.`,
    tools: [
      {
        name: 'publish_post',
        description: 'Publish the new blog post to the MAPL TECH blog',
        input_schema: {
          type: 'object',
          additionalProperties: false,
          required: ['slug', 'title', 'excerpt', 'category', 'readTime', 'author', 'coverImageQuery', 'content'],
          properties: {
            slug: {
              type: 'string',
              description: 'URL-friendly slug: lowercase letters, numbers, hyphens only',
            },
            title: {
              type: 'string',
              description: 'Compelling headline, 50-70 characters',
            },
            excerpt: {
              type: 'string',
              description: '1-2 sentence summary, 100-160 characters',
            },
            category: {
              type: 'string',
              enum: ['Automation & AI', 'Web Development', 'Internal Tools', 'Cloud Engineering', 'Industry'],
            },
            readTime: {
              type: 'number',
              description: 'Estimated read time in minutes (integer)',
            },
            author: {
              type: 'object',
              additionalProperties: false,
              required: ['name', 'role'],
              properties: {
                name: { type: 'string' },
                role: { type: 'string' },
              },
            },
            coverImageQuery: {
              type: 'string',
              description: '2-4 word Unsplash search query for the cover image',
            },
            content: {
              type: 'string',
              description: 'Full HTML content of the post',
            },
          },
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'publish_post' },
    messages: [
      {
        role: 'user',
        content: `Today is ${today}. Write a new MAPL TECH blog post for this week.

Already published (do NOT repeat these topics or reuse these slugs):
${existingTitles.map((t) => `- ${t}`).join('\n')}

Used slugs: ${existingSlugs.join(', ')}

Pick a fresh, timely topic. Rotate through categories  - don't write two Automation posts in a row if that's what the latest ones cover. Make it genuinely useful to agency owners and developers in Nigeria, Jamaica, or internationally.`,
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === 'tool_use');
  if (!toolUse) throw new Error('No tool_use block in response');

  const post = toolUse.input;
  console.log(`\nGenerated: "${post.title}"`);
  console.log(`Category:  ${post.category}`);
  console.log(`Author:    ${post.author.name}`);

  // Fetch cover image
  let coverImage, coverImageAlt;
  try {
    const img = await fetchUnsplashImage(post.coverImageQuery);
    coverImage = img.url;
    coverImageAlt = img.alt;
    console.log(`Image:     ${coverImage.slice(0, 80)}…`);
  } catch (err) {
    console.warn('Unsplash fetch failed, using fallback:', err.message);
    coverImage = 'https://images.unsplash.com/photo-1488229297570-58520851e868?auto=format&fit=crop&w=1200&q=80';
    coverImageAlt = post.title;
  }

  // Escape content for template literal
  const content = post.content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');

  // Escape strings for single-quoted fields
  const safe = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  const postEntry = `  {
    slug: '${safe(post.slug)}',
    title: '${safe(post.title)}',
    excerpt:
      '${safe(post.excerpt)}',
    category: '${post.category}',
    date: '${today}',
    readTime: ${Math.round(post.readTime)},
    author: { name: '${safe(post.author.name)}', role: '${safe(post.author.role)}' },
    coverImage: '${safe(coverImage)}',
    coverImageAlt: '${safe(coverImageAlt)}',
    content: \`
${content}
\`,
  },`;

  // Insert at the top of the blogPosts array (after the opening '[')
  const marker = 'export const blogPosts: BlogPost[] = [';
  const idx = src.indexOf(marker);
  if (idx === -1) throw new Error('Could not find blogPosts array in blog-posts.ts');

  const insertAt = idx + marker.length;
  const newSrc = src.slice(0, insertAt) + '\n' + postEntry + '\n' + src.slice(insertAt);

  writeFileSync(BLOG_FILE, newSrc, 'utf-8');
  console.log(`\n✓ Post inserted into ${BLOG_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
