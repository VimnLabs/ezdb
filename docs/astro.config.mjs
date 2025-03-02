// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { createStarlightTypeDocPlugin } from 'starlight-typedoc';
import starlightSidebarTopics from 'starlight-sidebar-topics';

const [typeDoc, typeDocSidebarGroup] = createStarlightTypeDocPlugin();

// https://astro.build/config
export default defineConfig({
	site: 'https://vimnlabs.github.io',
	base: 'ezdb/',
	integrations: [
		starlight({
			title: 'EzDataBase',
			logo: {
				src: './public/favicon.svg'
			},
			social: {
				github: 'https://github.com/VimnLabs/ezdb',
				discord: 'https://discord.gg/NUUW9ZMcKT'
			},
			components: {
				SiteTitle: './src/components/override/SiteTitle.astro',
				ThemeSelect: './src/components/override/ThemeSelect.astro'
			},
			customCss: ['/src/styles/global.css'],
			plugins: [
				starlightSidebarTopics([
					{
						label: 'Guides',
						link: 'guides/why',
						icon: 'open-book',
						items: [
							{ label: 'Why', link: 'guides/why' },
							'guides/installation',
							{
								label: 'Database',
								items: [
									'guides/database/setup',
									{ label: 'Examples', link: 'guides/database/examples' }
								]
							},
							{
								label: 'Backuper',
								items: [
									'guides/backup/setup',
									{ label: 'Examples', link: 'guides/backup/examples' }
								]
							}
						]
					},
					{
						label: 'Reference',
						link: '/reference/overview',
						icon: 'information',
						items: [typeDocSidebarGroup]
					},
					{
						label: 'Source Code',
						link: 'https://github.com/VimnLabs/ezdb',
						icon: 'github',
						badge: { text: 'External', variant: 'note' }
					},
					{
						label: 'NPM',
						link: 'https://www.npmjs.com/package/@vimn/ezdb',
						icon: 'seti:npm',
						badge: { text: 'External', variant: 'note' }
					}
				]),
				typeDoc({
					entryPoints: ['../package/src/index.ts'],
					output: 'reference',
					tsconfig: '../package/',
					typeDoc: {
						sort: ['enum-value-ascending', 'source-order'],
						parametersFormat: 'htmlTable',
						enumMembersFormat: 'htmlTable',
						skipErrorChecking: true,
						mergeReadme: false,
						fileExtension: '.mdx',
						useCodeBlocks: true,
						entryFileName: 'overview',
						hidePageHeader: true,
						name: 'API Reference'
					}
				})
			]
		})
	]
});
