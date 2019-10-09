# 玩车教授PC版

## 架构

```
页面模式：SSR
模块化工具： Webpack4 
自动化工具： Gulp
UI框架： Element-UI
请求框架：Axios
工具库：Lodash
视图渲染框架：Vue
统一状态管理工具：Vuex
前端路由：Vue-Router
开发模式：Vue-Loader ，SCSS
代码规范检查：EsLint 、StyleLint
代码规范:  eslint-plugin-vue
Vsode插件：Eslint、Stylelint、Vetur 、 Prettier
调试工具：Vue-devtoos
测试框架：Jest
Mock：MockJS
```

## 文件目录架构

```
├── /build/                     # webpack构建配置
├── /config/                    # 配置
├── mock.js                     # Mock接口配置
├── server.js	                # 服务器入口文件
├── router.js                   # 服务器路由
├── /src/                       # 前端代码文件
├── gulpfile.js                 # gulp配置文件
├── package.json                # 模块列表
├── README.md                   # 描述文件
```

## 使用

### 开发
```
npm run dev
```

### 构建
```
npm run build
```

### 启动服务器
```
npm run start
```