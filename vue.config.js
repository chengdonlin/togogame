const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    proxy: {
      '/api': {
        target: "http://192.168.31.204:10010",
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': ""
        },
      }
    }
  }
})
