# Wue

VUE轮子

## 文档

### options

### el 
    类型：Element | String
    详细：Wue挂载的目标元素节点

### data
    类型：Object | Function
    详细：Wue 实例的数据对象

### methods
    类型：{ [key: string]: Function }
    详细：Wue实例中可以调用的方法

### directive

#### w-bind 
    参考vue v-bind

#### w-if w-else w-else-if
    参考vue v-if v-else v-else-if

#### w-for
    参考vue v-for

#### w-html
    参考vue v-html

#### w-if
    参考vue v-if

#### w-modle
    参考vue v-modle

#### w-on
    参考vue v-on

#### w-once
    参考vue v-once

#### w-show
    参考vue v-show

#### w-text
    参考vue v-text


## 文件目录架构

```
├── /build/                     # webpack构建配置
├── /dist/                      # 构建文件
├── /src/                       # WUE源码入口
    ├── directive               # Wue指令源码
    ├── init                    # Wue初始化源码
    ├── observer                # Wue处理数据响应源码
    ├── parse                   # 解析AST源码
    ├── render-vnode            # 处理vtree源码
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
npm run dev-server //localhost:8080
```

### 构建
```
npm run build
```

### 启动服务器
```
npm run server //localhost:8080
```
