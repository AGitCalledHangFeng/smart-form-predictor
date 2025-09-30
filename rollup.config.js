export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/smart-form-predictor.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/smart-form-predictor.esm.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/smart-form-predictor.umd.js',
      format: 'umd',
      name: 'SmartFormPredictor',
      sourcemap: true
    }
  ]
};