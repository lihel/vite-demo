const fs = require("fs");
const path = require("path");
const Koa = require("koa");
const compilerSfc = require("@vue/compiler-sfc"); // .vue单文件
const compilerDom = require("@vue/compiler-dom"); // 模版

const app = new Koa();
function rewriteImport(content) {
  return content.replace(/from ['|"]([^'"]+)['|"]/g, function (s0, s1) {
    // console.log(s1);
    // . ../ /开头的都是相对路径
    if (s1[0] !== "." && s1[1] !== "/") {
      // 没有路径开头的都认为来自node_modules，为其添加前缀，便于解析时分开解析
      return `from '/@modules/${s1}'`;
    } else {
      return s0;
    }
  });
}
app.use(async (ctx) => {
  ctx.body = "hello";
  const { request } = ctx;
  const { url } = request;
  if (url === "/") {
    // 访问首页解析html
    ctx.type = "text/html";
    ctx.body = fs.readFileSync("./index.html", "utf-8");
  } else if (url.endsWith(".js")) {
    // 访问js
    console.log("这是一个js文件，do something");
    // js需要做额外处理，不是简单的静态资源
    const p = path.resolve(__dirname, url.slice(1));
    ctx.type = "application/javascript";
    const ret = fs.readFileSync(p, "utf-8");
    ctx.body = rewriteImport(ret);
    // 如果是react还需解析jsx
  } else if (url.startsWith("/@modules/")) {
    // 这是node_modules里的东西
    const prefix = path.resolve(
      __dirname,
      "node_modules",
      url.replace("/@modules/", "")
    );
    console.log(prefix);
    const module = require(prefix + "/package.json").module;
    console.log(module);
    const p = path.resolve(prefix, module);
    const ret = fs.readFileSync(p, "utf-8");
    ctx.type = "application/javascript";
    ctx.body = rewriteImport(ret);
  } else if (url.indexOf(".vue") > -1) {
    // vue单文件组件
    const p = path.resolve(__dirname, url.split("?")[0].slice(1));
    const { descriptor } = compilerSfc.parse(fs.readFileSync(p, "utf-8"));
    if (!request.query.type) {
      ctx.type = "application/javascript";
      // 借用vue自带的 compile 框架解析单文件组件，其实相当于vue-loader做的事情
      ctx.body = `
    const __script = ${descriptor.script.content
      .replace("export default ", "")
      .replace(/\n/g, "")}
    import { render as __render } from "${url}?type=template"
    __script.render = __render
    export default __script`;
    } else if (request.query.type === "template") {
      // 模版内容
      const template = descriptor.template;
      // 要在server端做compiler
      const render = compilerDom.compile(template.content, { mode: "module" })
        .code;
      ctx.type = "application/javascript";
      ctx.body = rewriteImport(render);
    }
  }
});
// vite可用于开发环境，build还是要webpack或者rollup
// 好处是首页用到啥，就import啥，天生的懒加载
// webpack是全量打包，放在内存

app.listen(3001, () => {
  console.log("listen 3001");
});

// 能够访问index.html
// 实现简单的vite原理
