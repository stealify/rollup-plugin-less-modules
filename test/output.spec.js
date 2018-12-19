import test from 'ava';
import { rollup } from 'rollup';
import { resolve } from 'path';
import { existsSync, removeSync } from 'fs-extra';
import lessModules from './..';

const temporaryPath = resolve(__dirname, '.output', 'output');

test.before(() => {
  // Performing cleanup before running tests and not after so that the output can be manually inspected afterwards
  removeSync(temporaryPath);
});

test('should output generated css bundle', async t => {
  const dest = resolve(temporaryPath, t._test.title.replace(/\s/g, '-'));
  const inputOptions = {
    entry: 'test/fixtures/output/index.js',
    //output: { file: `${dest}.js`},
    plugins: [
      lessModules({
        output: true
      })
    ]
  };

  const outputOptions = { file: `${dest}.js`, format: 'es' };
  const bundle = await rollup(inputOptions);
  //const { code, map } = await bundle.generate(outputOptions);
  await bundle.write(outputOptions);
  
  t.true(existsSync(`${dest}.js`));
  t.false(existsSync(`${dest}.js.map`));
});