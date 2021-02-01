# 新神杀（DSanguosha）

> DSanguosha

___

## 简介

新神杀（DSanguosha），是一款基于TypeScript+React的三国杀非官方开源软件，开发者：donle，现由donle团队继续维护源码。

## 项目地址

<https://github.com/donle/sgs>

## 文档索引

+ [Core](./core/core-index.md)
+ [武将一览](./characters/characters-index.md)

## 说明

武将一览的文档系自动生成。在doc下执行npm i，然后执行npm run generate（Windows为npm run generate:win）即可将其生成至最新版。

## 相关约定

+ 一个文档只有一个一级标题，标题后跟上到本文件的“路径”。
+ 拥有存取器（get/set）加持的成员称为“属性”。
+ 枚举一律列表格描述。
+ 将一个比较大的class分为属性、成员函数、公有成员、保护成员、静态公有成员、相关的非成员几部分进行描述。一部分可能还会单独描述其使用的装饰器函数。
+ 核心类的继承关系要讲明。
+ 比较大type和interface暂且都按照class来描述。
