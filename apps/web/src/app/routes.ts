import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	type RouteConfigEntry,
	index,
	route,
} from '@react-router/dev/routes';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

type Tree = {
	path: string;
	children: Tree[];
	hasPage: boolean;
	isParam: boolean;
	paramName: string;
	isCatchAll: boolean;
};

function buildRouteTree(dir: string, basePath = ''): Tree {
	const files = readdirSync(dir);
	const node: Tree = {
		path: basePath,
		children: [],
		hasPage: false,
		isParam: false,
		isCatchAll: false,
		paramName: '',
	};

	// Check if the current directory name indicates a parameter
	const dirName = basePath.split('/').pop();
	if (dirName?.startsWith('[') && dirName.endsWith(']')) {
		node.isParam = true;
		const paramName = dirName.slice(1, -1);

		// Check if it's a catch-all parameter (e.g., [...ids])
		if (paramName.startsWith('...')) {
			node.isCatchAll = true;
			node.paramName = paramName.slice(3); // Remove the '...' prefix
		} else {
			node.paramName = paramName;
		}
	}

	for (const file of files) {
		const filePath = join(dir, file);
		const stat = statSync(filePath);

		if (stat.isDirectory()) {
			const childPath = basePath ? `${basePath}/${file}` : file;
			const childNode = buildRouteTree(filePath, childPath);
			node.children.push(childNode);
		} else if (file === 'page.jsx' || file === 'page.tsx') {
			node.hasPage = true;
    }
	}

	return node;
}

function generateRoutes(node: Tree): RouteConfigEntry[] {
	const routes: RouteConfigEntry[] = [];

	if (node.hasPage) {
		// Determine file extension by checking which file exists
		const basePath = node.path === '' ? `./${node.path}page` : `./${node.path}/page`;
		const jsxPath = `${basePath}.jsx`;
		const tsxPath = `${basePath}.tsx`;
		
		// Check if tsx file exists first, fallback to jsx
		const fullTsxPath = join(__dirname, node.path === '' ? 'page.tsx' : `${node.path}/page.tsx`);
		const componentPath = existsSync(fullTsxPath) ? tsxPath : jsxPath;

		if (node.path === '') {
			routes.push(index(componentPath));
		} else {
			// Handle parameter routes
			let routePath = node.path;

			// Replace all parameter segments in the path
			const segments = routePath.split('/');
			const processedSegments = segments.map((segment) => {
				if (segment.startsWith('[') && segment.endsWith(']')) {
					const paramName = segment.slice(1, -1);

					// Handle catch-all parameters (e.g., [...ids] becomes *)
					if (paramName.startsWith('...')) {
						return '*'; // React Router's catch-all syntax
					}
					// Handle optional parameters (e.g., [[id]] becomes :id?)
					if (paramName.startsWith('[') && paramName.endsWith(']')) {
						return `:${paramName.slice(1, -1)}?`;
					}
					// Handle regular parameters (e.g., [id] becomes :id)
					return `:${paramName}`;
				}
				return segment;
			});

			routePath = processedSegments.join('/');
			routes.push(route(routePath, componentPath));
		}
	}

	for (const child of node.children) {
		routes.push(...generateRoutes(child));
	}

	return routes;
}
if (import.meta.env.DEV) {
	import.meta.glob('./**/page.{jsx,tsx}', {});
	if (import.meta.hot) {
		import.meta.hot.accept((newSelf) => {
			import.meta.hot?.invalidate();
		});
	}
}
const tree = buildRouteTree(__dirname);
const notFound = route('*?', './__create/not-found.tsx');
const routes = [...generateRoutes(tree), notFound];

export default routes;
