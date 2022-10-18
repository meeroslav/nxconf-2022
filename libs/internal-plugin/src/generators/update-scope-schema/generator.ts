import {
  Tree,
  formatFiles,
  ProjectConfiguration,
  getProjects,
  updateJson,
  updateProjectConfiguration
} from '@nrwl/devkit';


export default async function (tree: Tree) {
  addScopeIfMissing(tree);
  const projects = getProjects(tree);
  const scopes = getScopes(projects);
  updateSchema(tree, scopes);
  updateSchemaInterface(tree, scopes);
  await formatFiles(tree);
}

function getScopes(projectMap: Map<string, ProjectConfiguration>) {
  const projects: any[] = Array.from(projectMap.values());
  const allScopes: string[] = projects
    .map((project) =>
      project.tags
        // take only those that point to scope
        .filter((tag: string) => tag.startsWith('scope:'))
    )
    // flatten the array
    .reduce((acc, tags) => [...acc, ...tags], [])
    // remove prefix `scope:`
    .map((scope: string) => scope.slice(6));
  // remove duplicates
  return Array.from(new Set(allScopes));
}

function updateSchemaInterface(tree: Tree, scopes: string[]) {
  const joinScopes = scopes.map((s) => `'${s}'`).join(' | ');
  const interfaceDefinitionFilePath =
    'libs/internal-plugin/src/generators/util-lib/schema.d.ts';
  const newContent = `export interface UtilLibGeneratorSchema {
    name: string;
    directory: ${joinScopes};
  }`;
  tree.write(interfaceDefinitionFilePath, newContent);
}

function updateSchema(tree, scopes: string[]) {
  updateJson(tree, 'libs/internal-plugin/src/generators/util-lib/schema.json', (json) => {
    json.properties.directory['x-prompt'].items = scopes.map((s) => ({
      value: s,
      label: s
    }));
    return json;
  });
}

function addScopeIfMissing(tree: Tree) {
  const projects = getProjects(tree);
  projects.forEach((project, name) => {
    if (!project.tags.some((tag) => tag.startsWith('scope:'))) {
      const scope = name.split('-')[0];
      project.tags.push(`scope:${scope}`);
      updateProjectConfiguration(tree, name, project);
    }
  });
}
