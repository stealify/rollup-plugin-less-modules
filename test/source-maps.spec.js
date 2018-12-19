import test from 'ava';
import { rollup } from 'rollup';
import { resolve } from 'path';
import { existsSync, removeSync, readJsonSync } from 'fs-extra';
import lessModules from './..';

const temporaryPath = resolve(__dirname, '.output', 'source-maps');

test.before(() => {
  // Performing cleanup before running tests and not after so that the output can be manually inspected afterwards
  removeSync(temporaryPath);
});

test('should export "sourceMap" to ES module', t => {
  return rollup({
    input: 'test/fixtures/sourcemaps/import-source-maps.js',
    plugins: [
      lessModules()
    ]
  })

    .then(bundle => bundle.generate({ format: 'es' }))

    .then(output => {
      t.true(output.code.indexOf('"version"') >= 0);
    })

    .catch(error => t.fail(`${error}`));
});

test('should generate inline sourcemaps', async t => {
  const bundle = await rollup({
    input: 'test/fixtures/sourcemaps/import-styles.js',
    plugins: [
      lessModules()
    ]
  });

  const { code } = await bundle.generate({ format: 'es', sourcemap: 'inline'});

    
  t.true(code.indexOf('sourceMappingURL') >= 0);
    

});

test('should output sourcemaps to a file', t => {
  const dest = resolve(temporaryPath, t._test.title.replace(/\s/g, '-'));
  const opts = { format: 'es', file: `${dest}.js`, sourcemap: true };

  return rollup({
    input: 'test/fixtures/sourcemaps/import-styles.js',
    plugins: [
      lessModules({ output: true })
    ]
  })

    .then(bundle => bundle.generate(opts) && bundle)

    .then((bundle) => {
      return bundle.write(opts);
    })

    .then(() => {
      const cssFilePath = `${dest}.js`;
      t.true(existsSync(cssFilePath));
      t.true(existsSync(`${dest}.js.map`));

      const maps = readJsonSync(`${dest}.js.map`, {throws: false});
      t.true(maps !== null);
    })

    .catch(error => t.fail(`${error}`));
});