import { libraryGenerator } from '@nrwl/workspace/generators';
import { Tree, formatFiles } from '@nrwl/devkit';
import { UtilLibGeneratorSchema } from './schema';

export default async function (tree: Tree, schema: UtilLibGeneratorSchema) {
  await libraryGenerator(tree, {
    name: `util-${schema.name}`,
    directory: schema.directory,
    tags: `type:util,scope:${schema.directory}`
  });
  await formatFiles(tree);
}
