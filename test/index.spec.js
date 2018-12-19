import test from 'ava';
import { rollup } from 'rollup';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import { resolve } from 'path';
import { existsSync, removeSync } from 'fs-extra';
import lessModules from './..';

const temporaryPath = resolve(__dirname, '.output', 'index');

test.before(() => {
  // Performing cleanup before running tests and not after so that the output can be manually inspected afterwards
  removeSync(temporaryPath);
});

test('should compile and import basic less files', async t => {
  const bundle = await rollup({
    input: 'test/fixtures/basic/index.js',
    plugins: [
      lessModules()
    ]
  });
    
  const { code } = await bundle.generate({ format: 'es' });  
  t.true(code.indexOf('body') >= 0);
    
});

test('should compile and import less files with imports', async t => {
  const bundle = await rollup({
    input: 'test/fixtures/less-import/index.js',
    plugins: [
      lessModules()
    ]
  });

  const { code } = bundle.generate({ format: 'es' });
  t.true(code.indexOf('body') >= 0);
});

test('should compile and post-process the styles', async t => {
  const options = {
    output: { sourcemap: {} }
  };

  function processor(tCode, id) {
    const postCssOptions = {
      from: id,
      to: id,
      map: {
        prev: tCode.map
      }
    };
    return postcss([autoprefixer])
      .process(tCode.css, postCssOptions)
      .then(result => ({
        css: result.css,
        map: result.map.toString()
      }));
  }

  const bundle = await rollup({
    input: 'test/fixtures/post-process/index.js',
    plugins: [
      lessModules({options, processor})
    ]
  });

  const { code } = bundle.generate({ format: 'es' });  
  t.true(code.indexOf('-ms-flexbox') >= 0);
});

test('should clean and minify the compiled CSS content', async t => {
  const bundle = await rollup({
    input: 'test/fixtures/minify/index.js',
    plugins: [
      lessModules({
        minify: true
      })
    ]
  });

  const {code} = await bundle.generate({ format: 'es' });  
  t.true(code.indexOf('body{margin:0}') > 0);
});
