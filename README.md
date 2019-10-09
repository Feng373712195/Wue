# Wue

VUE轮子

## 文档

### 指令

#### w-bind 

#### w-if w-else w-else-if

#### w-for

#### w-html

#### w-for

#### w-modle

#### w-on

#### w-once

#### w-show

#### w-text


## 文件目录架构

```
├── /build/                     # webpack构建配置
├── /dist/                      # 构建文件
├── /src/                       # WUE源码入口
    ├── directive               # Wue指令源码
    ├── init                    # Wue初始化源码
    ├── observer                # Wue处理数据响应源码
    ├── parse                   # 解析AST源码
    ├── render-vnode            # 解析vtree源码
    ├── uilt                    # 工具模块
    ├── virtual-dom             # virtual-dom源码
    ├── warn                    # 错误警告模块
    ├── index                   # Wue总入口
├── /view/                      # 前端代码文件
    ├── /index.html             # 测试使用html    
    |—— /index.js               # 测试使用js
├── app.js	                    # 服务器入口文件
├── package.json                # 模块列表
├── README.md                   # 描述文件
```

## 使用

### 开发
```
npm run dev-server
```

### 构建
```
npm run build
```

### 启动服务器
```
npm run server
```